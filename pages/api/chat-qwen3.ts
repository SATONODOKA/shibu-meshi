import { NextApiRequest, NextApiResponse } from 'next';
import { processChatWithQwen3 } from '../../lib/qwen3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'メッセージが必要です' });
    }

    // Qwen3でチャット処理
    const aiResponse = await processChatWithQwen3(chatHistory, message);

    // チャット履歴を更新
    const updatedHistory = [
      ...chatHistory,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ];

    // 結果を返す
    res.status(200).json({
      success: true,
      response: aiResponse,
      chatHistory: updatedHistory,
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'チャット処理に失敗しました',
      success: false 
    });
  }
} 