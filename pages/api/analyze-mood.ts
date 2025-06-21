import type { NextApiRequest, NextApiResponse } from 'next'
import { openai, MOOD_ANALYSIS_PROMPT } from '@/lib/openai'
import type { MoodAnalysis, Location } from '@/types'

interface AnalyzeMoodRequest {
  mood: string
  location: Location
}

interface AnalyzeMoodResponse {
  analysis: MoodAnalysis
  needsMoreInfo: boolean
  question?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeMoodResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', analysis: {} as MoodAnalysis, needsMoreInfo: false })
  }

  try {
    const { mood, location }: AnalyzeMoodRequest = req.body

    if (!mood || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        analysis: {} as MoodAnalysis, 
        needsMoreInfo: false 
      })
    }

    // OpenAI APIで気分分析
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: MOOD_ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: `以下の気分を分析してください：「${mood}」`
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
    let analysisResult
    try {
      analysisResult = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid response format from AI')
    }

    const analysis: MoodAnalysis = {
      mood: analysisResult.mood || '',
      temperature: analysisResult.temperature || '',
      texture: analysisResult.texture || '',
      appetite: analysisResult.appetite || '',
      atmosphere: analysisResult.atmosphere || '',
      genres: analysisResult.genres || [],
      confidence: analysisResult.confidence || 0.5,
    }

    res.status(200).json({
      analysis,
      needsMoreInfo: analysisResult.needsMoreInfo || false,
      question: analysisResult.question
    })

  } catch (error) {
    console.error('Mood analysis error:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      analysis: {} as MoodAnalysis, 
      needsMoreInfo: false 
    })
  }
} 