import { MOOD_KEYWORDS, GENRE_KEYWORDS, AVOID_KEYWORDS } from '../dictionaries/mood_keywords.js';

/**
 * 自然文入力解析クラス
 * AIを使わずにキーワードマッチングで気分・欲求を構造化
 */
export class TextAnalyzer {
  constructor() {
    this.negationWords = ['ない', 'なし', 'いらない', '嫌', 'だめ', '避けたい'];
  }

  /**
   * メイン解析関数
   * @param {string} text - ユーザー入力テキスト
   * @returns {Object} 構造化された気分・欲求データ
   */
  analyze(text) {
    const normalizedText = this.normalizeText(text);
    
    return {
      desired_keywords: this.extractDesiredKeywords(normalizedText),
      avoid_keywords: this.extractAvoidKeywords(normalizedText),
      suggested_genres: this.extractGenres(normalizedText),
      appetite_level: this.detectAppetiteLevel(normalizedText),
      time_of_day: this.detectTimeOfDay(normalizedText),
      mood: this.extractMoodKeywords(normalizedText),
      location_hint: this.extractLocationHint(normalizedText),
      confidence_score: this.calculateConfidence(normalizedText)
    };
  }

  /**
   * テキスト正規化
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[！？。，、]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 欲しいキーワードを抽出
   */
  extractDesiredKeywords(text) {
    const desired = [];
    
    Object.entries(MOOD_KEYWORDS).forEach(([category, data]) => {
      data.keywords.forEach(keyword => {
        if (text.includes(keyword) && !this.isNegated(text, keyword)) {
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

  /**
   * 避けたいキーワードを抽出
   */
  extractAvoidKeywords(text) {
    const avoid = [];
    
    Object.entries(AVOID_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword) || this.isNegated(text, keyword)) {
          avoid.push({
            keyword,
            category
          });
        }
      });
    });

    return avoid;
  }

  /**
   * ジャンル推定
   */
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

  /**
   * 食欲レベル検出
   */
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

  /**
   * 時間帯検出
   */
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
    
    // 現在時刻から推定
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 22) return 'dinner';
    return 'other';
  }

  /**
   * 気分キーワード抽出
   */
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

  /**
   * 場所ヒント抽出
   */
  extractLocationHint(text) {
    const locationPatterns = [
      /([駅周辺|駅前|駅ちか|駅から])/g,
      /([近く|近い|そば|付近])/g,
      /([歩いて|徒歩|車で])/g
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return '';
  }

  /**
   * 否定表現の検出
   */
  isNegated(text, keyword) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex === -1) return false;
    
    const beforeText = text.substring(0, keywordIndex);
    const words = beforeText.split(/\s+/);
    const lastFewWords = words.slice(-3).join(' ');
    
    return this.negationWords.some(negWord => 
      lastFewWords.includes(negWord)
    );
  }

  /**
   * 信頼度スコア計算
   */
  calculateConfidence(text) {
    const totalKeywords = Object.values(MOOD_KEYWORDS)
      .concat(Object.values(GENRE_KEYWORDS))
      .reduce((total, data) => total + (data.keywords || []).length, 0);
    
    let matchedKeywords = 0;
    
    // キーワードマッチ数をカウント
    Object.values(MOOD_KEYWORDS).forEach(data => {
      data.keywords.forEach(keyword => {
        if (text.includes(keyword)) matchedKeywords++;
      });
    });
    
    return Math.min(matchedKeywords / 5, 1.0); // 最大5個のキーワードで100%
  }

  /**
   * 解析結果のサマリー生成
   */
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