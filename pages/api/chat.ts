import type { NextApiRequest, NextApiResponse } from 'next'
import { openai, CHAT_PROMPT } from '@/lib/openai'
import type { MoodAnalysis, ChatMessage } from '@/types'

interface ChatRequest {
  message: string
  context: MoodAnalysis
  history: ChatMessage[]
}

interface ChatResponse {
  response: string
  readyToSearch: boolean
  updatedAnalysis: MoodAnalysis
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      response: '', 
      readyToSearch: false, 
      updatedAnalysis: {} as MoodAnalysis 
    })
  }

  try {
    const { message, context, history }: ChatRequest = req.body

    if (!message) {
      return res.status(400).json({ 
        error: 'Missing message', 
        response: '', 
        readyToSearch: false, 
        updatedAnalysis: context 
      })
    }

    // 会話履歴を整理
    const conversationHistory = history.map(msg => ({
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }))

    // OpenAI APIでチャット処理
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${CHAT_PROMPT}\n\n現在の分析状況: ${JSON.stringify(context, null, 2)}`
        },
        ...conversationHistory,
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // JSONレスポンスをパース
    let chatResult
    try {
      chatResult = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      // フォールバック: テキストをそのまま返す
      return res.status(200).json({
        response: responseText,
        readyToSearch: false,
        updatedAnalysis: context
      })
    }

    res.status(200).json({
      response: chatResult.response,
      readyToSearch: chatResult.readyToSearch || false,
      updatedAnalysis: chatResult.updatedAnalysis || context
    })

  } catch (error) {
    console.error('Chat processing error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      response: 'すみません、エラーが発生しました。もう一度お試しください。',
      readyToSearch: false,
      updatedAnalysis: {} as MoodAnalysis
    })
  }
} 