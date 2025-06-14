// TextAnalyzerをインライン実装（CommonJS対応）
const MOOD_KEYWORDS = {
  // 温度・食感
  hot: {
    keywords: ['温かい', 'あったかい', 'ホット', '熱い', '温まる', '湯気', 'アツアツ'],
    weight: 1.0
  },
  cold: {
    keywords: ['冷たい', 'つめたい', 'クール', 'ひんやり', '冷える', 'アイス'],
    weight: 1.0
  },
  crispy: {
    keywords: ['サクサク', 'カリカリ', 'パリパリ', 'クリスピー', '揚げ物', 'フライ'],
    weight: 0.8
  },
  soft: {
    keywords: ['柔らかい', 'やわらか', 'ふわふわ', 'とろとろ', 'なめらか'],
    weight: 0.8
  },
  // 食欲レベル
  light: {
    keywords: ['軽め', 'あっさり', 'さっぱり', 'ヘルシー', '少し', 'ちょっと', '小腹'],
    weight: 1.2
  },
  heavy: {
    keywords: ['がっつり', 'ボリューム', 'お腹いっぱい', 'たくさん', '満腹', 'ヘビー'],
    weight: 1.2
  },
  // 時間帯
  morning: {
    keywords: ['朝', 'モーニング', '午前', '朝食', '朝ごはん', '朝から'],
    weight: 1.0
  },
  lunch: {
    keywords: ['昼', 'ランチ', '昼食', '昼ごはん', 'お昼', '正午'],
    weight: 1.0
  },
  dinner: {
    keywords: ['夜', '夕', '晩', 'ディナー', '夕食', '夕飯', '晩飯', '夜ご飯'],
    weight: 1.0
  },
  // 気分・シチュエーション
  comfort: {
    keywords: ['癒し', 'ほっこり', '安らぐ', 'リラックス', '懐かしい', 'ほっと'],
    weight: 0.9
  },
  energy: {
    keywords: ['元気', 'パワー', 'エネルギー', '活力', 'スタミナ', '疲れた'],
    weight: 0.9
  },
  celebration: {
    keywords: ['お祝い', '記念', '特別', '贅沢', 'ご褒美', 'スペシャル'],
    weight: 0.8
  }
};

const GENRE_KEYWORDS = {
  japanese: {
    keywords: ['和食', '日本料理', '寿司', 'そば', 'うどん', '天ぷら', '焼き鳥', '定食'],
    genres: ['和食', '寿司', 'そば・うどん', '天ぷら', '焼鳥']
  },
  chinese: {
    keywords: ['中華', '中国料理', 'ラーメン', '餃子', '炒飯', '麻婆豆腐', '北京ダック'],
    genres: ['中華料理', '中国料理', 'ラーメン']
  },
  western: {
    keywords: ['洋食', 'パスタ', 'ピザ', 'ハンバーグ', 'ステーキ', 'オムライス'],
    genres: ['洋食', 'イタリアン', 'フレンチ', 'ステーキ']
  },
  korean: {
    keywords: ['韓国', 'キムチ', 'ビビンバ', '焼肉', 'チヂミ', 'サムギョプサル'],
    genres: ['韓国料理', '焼肉']
  },
  cafe: {
    keywords: ['カフェ', 'コーヒー', 'スイーツ', 'ケーキ', 'パン', 'サンドイッチ'],
    genres: ['カフェ', 'ベーカリー', 'スイーツ']
  }
};


class TextAnalyzer {
  constructor() {
    this.negationWords = ['ない', 'なし', 'いらない', '嫌', 'だめ', '避けたい'];
  }

  analyze(text) {
    const normalizedText = this.normalizeText(text);
    
    return {
      desired_keywords: this.extractDesiredKeywords(normalizedText),
      avoid_keywords: [],
      suggested_genres: this.extractGenres(normalizedText),
      appetite_level: this.detectAppetiteLevel(normalizedText),
      time_of_day: this.detectTimeOfDay(normalizedText),
      mood: this.extractMoodKeywords(normalizedText),
      location_hint: '',
      confidence_score: this.calculateConfidence(normalizedText)
    };
  }

  normalizeText(text) {
    return text.toLowerCase().replace(/[！？。，、]/g, '').replace(/\s+/g, ' ').trim();
  }

  extractDesiredKeywords(text) {
    const desired = [];
    
    Object.entries(MOOD_KEYWORDS).forEach(([category, data]) => {
      data.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          desired.push({
            keyword,
            category,
            weight: data.weight
          });
        }
      });
    });

    return desired.sort((a, b) => b.weight - a.weight);
  }

  extractGenres(text) {
    const genres = [];
    
    Object.entries(GENRE_KEYWORDS).forEach(([category, data]) => {
      let matchCount = 0;
      data.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          matchCount++;
        }
      });
      
      if (matchCount > 0) {
        genres.push({
          category,
          genres: data.genres,
          confidence: matchCount / data.keywords.length
        });
      }
    });

    return genres.sort((a, b) => b.confidence - a.confidence);
  }

  detectAppetiteLevel(text) {
    const lightKeywords = MOOD_KEYWORDS.light.keywords;
    const heavyKeywords = MOOD_KEYWORDS.heavy.keywords;
    
    const lightScore = lightKeywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? 1 : 0);
    }, 0);
    
    const heavyScore = heavyKeywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (lightScore > heavyScore) return 'light';
    if (heavyScore > lightScore) return 'heavy';
    return 'normal';
  }

  detectTimeOfDay(text) {
    const timeCategories = ['morning', 'lunch', 'dinner'];
    
    for (const category of timeCategories) {
      const keywords = MOOD_KEYWORDS[category].keywords;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return category;
        }
      }
    }
    
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 22) return 'dinner';
    return 'other';
  }

  extractMoodKeywords(text) {
    const moodCategories = ['comfort', 'energy', 'celebration'];
    const moods = [];
    
    moodCategories.forEach(category => {
      const keywords = MOOD_KEYWORDS[category].keywords;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          moods.push({
            mood: category,
            keyword,
            weight: MOOD_KEYWORDS[category].weight
          });
        }
      });
    });
    
    return moods;
  }

  calculateConfidence(text) {
    let matchedKeywords = 0;
    
    Object.values(MOOD_KEYWORDS).forEach(data => {
      data.keywords.forEach(keyword => {
        if (text.includes(keyword)) matchedKeywords++;
      });
    });
    
    return Math.min(matchedKeywords / 5, 1.0);
  }

  generateSummary(analysisResult) {
    const { desired_keywords, suggested_genres, appetite_level, time_of_day } = analysisResult;
    
    let summary = '';
    
    if (time_of_day !== 'other') {
      const timeMap = {
        morning: '朝',
        lunch: '昼',
        dinner: '夜'
      };
      summary += `${timeMap[time_of_day]}の`;
    }
    
    if (appetite_level === 'light') {
      summary += '軽めの';
    } else if (appetite_level === 'heavy') {
      summary += 'がっつりとした';
    }
    
    if (desired_keywords.length > 0) {
      const topKeyword = desired_keywords[0];
      summary += `${topKeyword.keyword}`;
    }
    
    if (suggested_genres.length > 0) {
      const topGenre = suggested_genres[0];
      summary += `${topGenre.category === 'japanese' ? '和食' : 
                   topGenre.category === 'chinese' ? '中華' :
                   topGenre.category === 'western' ? '洋食' : 
                   topGenre.category}系`;
    }
    
    summary += 'のお店をお探しですね。';
    
    return summary;
  }
}

exports.handler = async (event, context) => {
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // プリフライトリクエスト対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // POSTリクエストのみ受け付け
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // リクエストボディを解析
    const { text } = JSON.parse(event.body);
    
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'テキスト入力が必要です',
          details: 'text パラメータに文字列を指定してください'
        })
      };
    }

    // テキスト解析実行
    console.log('解析開始:', text);
    const analyzer = new TextAnalyzer();
    const analysisResult = analyzer.analyze(text);
    const summary = analyzer.generateSummary(analysisResult);

    console.log('解析結果:', analysisResult);

    // レスポンス
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        input: text,
        analysis: analysisResult,
        summary: summary,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('解析エラー:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '解析処理でエラーが発生しました',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// 使用例レスポンス:
/*
{
  "success": true,
  "input": "朝は軽め、今は温かいものがほしい",
  "analysis": {
    "desired_keywords": [
      { "keyword": "軽め", "category": "light", "weight": 1.2 },
      { "keyword": "温かい", "category": "hot", "weight": 1.0 }
    ],
    "avoid_keywords": [],
    "suggested_genres": [],
    "appetite_level": "light",
    "time_of_day": "morning",
    "mood": [],
    "location_hint": "",
    "confidence_score": 0.4
  },
  "summary": "朝の軽めの温かいのお店をお探しですね。",
  "timestamp": "2025-01-18T12:00:00.000Z"
}
*/ 