// Qwen3ローカルAPIクライアント設定
import axios from 'axios';

// Ollamaローカルサーバーの設定
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const QWEN3_MODEL = process.env.QWEN3_MODEL || 'qwen3:4b';

// Qwen3クライアント
export const qwen3Client = axios.create({
  baseURL: OLLAMA_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒タイムアウト
});

// 気分分析用プロンプトテンプレート
export const MOOD_ANALYSIS_PROMPT = `あなたは気分分析の専門家です。ユーザーの気分や要望を分析して、料理のジャンルや雰囲気を推薦してください。

以下の形式で必ず回答してください：
{
  "cuisine_types": ["ジャンル1", "ジャンル2", "ジャンル3"],
  "atmosphere": "求める雰囲気",
  "price_range": "予算帯（安い/普通/高い）",
  "dining_style": "食事スタイル（一人/友達と/デート/家族）",
  "additional_questions": ["追加で聞きたい質問1", "質問2"]
}

ユーザーの入力: "{user_input}"`;

// チャット用プロンプトテンプレート
export const CHAT_PROMPT = `あなたは親しみやすい食事アドバイザーです。ユーザーとの会話を通じて、より詳細な好みを把握してください。

会話履歴:
{chat_history}

ユーザー: {user_message}

自然な日本語で親しみやすく返答してください。必要に応じて追加の質問をして、ユーザーの好みをより深く理解してください。`;

// Qwen3 API呼び出し関数
export async function callQwen3(messages: any[]) {
  try {
    const response = await qwen3Client.post('/api/chat', {
      model: QWEN3_MODEL,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
      }
    });

    return response.data.message.content;
  } catch (error) {
    console.error('Qwen3 API エラー:', error);
    throw new Error('AI分析に失敗しました。Ollamaサーバーが起動していることを確認してください。');
  }
}

// 気分分析関数
export async function analyzeMoodWithQwen3(userInput: string) {
  const messages = [
    {
      role: 'system',
      content: 'あなたは優秀な気分分析AIです。ユーザーの気分を正確に分析してください。'
    },
    {
      role: 'user',
      content: MOOD_ANALYSIS_PROMPT.replace('{user_input}', userInput)
    }
  ];

  const response = await callQwen3(messages);
  
  try {
    // JSONレスポンスをパース
    const analysis = JSON.parse(response);
    return analysis;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    // フォールバック：構造化されていない場合のデフォルト値
    return {
      cuisine_types: ['和食', '洋食', 'アジア料理'],
      atmosphere: 'リラックスできる',
      price_range: '普通',
      dining_style: '友達と',
      additional_questions: ['どのような料理が特に食べたいですか？']
    };
  }
}

// チャット処理関数
export async function processChatWithQwen3(chatHistory: any[], userMessage: string) {
  const historyText = chatHistory
    .map(msg => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`)
    .join('\n');

  const messages = [
    {
      role: 'system',
      content: 'あなたは親しみやすい食事アドバイザーです。'
    },
    {
      role: 'user',
      content: CHAT_PROMPT
        .replace('{chat_history}', historyText)
        .replace('{user_message}', userMessage)
    }
  ];

  return await callQwen3(messages);
} 