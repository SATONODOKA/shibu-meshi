import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeMoodWithQwen3 } from '../../lib/qwen3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood, location } = req.body;

    if (!mood) {
      return res.status(400).json({ error: '気分の入力が必要です' });
    }

    // Qwen3で気分分析
    const analysis = await analyzeMoodWithQwen3(mood);

    // 結果を返す
    res.status(200).json({
      success: true,
      analysis,
      location: location || null,
    });

  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : '気分分析に失敗しました',
      success: false 
    });
  }
} 