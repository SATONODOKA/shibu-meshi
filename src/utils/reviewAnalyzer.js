/**
 * 口コミ分析クラス（AI不使用）
 * キーワードマッチング + 感情分析でスコアリング
 */
export class ReviewAnalyzer {
  constructor() {
    // ポジティブキーワード
    this.positiveKeywords = {
      taste: {
        keywords: ['美味しい', 'おいしい', 'うまい', '絶品', '最高', '素晴らしい', '感動'],
        weight: 2.0
      },
      service: {
        keywords: ['親切', '丁寧', '感じがいい', '接客', 'サービス', '対応'],
        weight: 1.5
      },
      atmosphere: {
        keywords: ['雰囲気', '居心地', 'くつろげる', '落ち着く', '癒し', 'リラックス'],
        weight: 1.3
      },
      value: {
        keywords: ['コスパ', 'お得', '安い', 'リーズナブル', '価値', '満足'],
        weight: 1.8
      },
      quality: {
        keywords: ['新鮮', '品質', 'こだわり', '手作り', '本格的', '上質'],
        weight: 1.6
      }
    };

    // ネガティブキーワード
    this.negativeKeywords = {
      taste: {
        keywords: ['まずい', '不味い', 'いまいち', '微妙', '期待外れ', 'がっかり'],
        weight: -2.0
      },
      service: {
        keywords: ['態度が悪い', '無愛想', '遅い', '冷たい', '最悪', '不快'],
        weight: -1.5
      },
      cleanliness: {
        keywords: ['汚い', '不衛生', '臭い', 'ベタベタ', '清潔感がない'],
        weight: -1.8
      },
      wait: {
        keywords: ['待たされた', '時間がかかる', '遅すぎる', '混雑', '待ち時間'],
        weight: -1.2
      },
      price: {
        keywords: ['高い', '高すぎる', 'ぼったくり', '値段の割に', 'コスパ悪い'],
        weight: -1.6
      }
    };

    // 温度・食感キーワード
    this.textureKeywords = {
      hot: ['温かい', 'あったかい', 'アツアツ', '熱々', '湯気'],
      cold: ['冷たい', 'つめたい', 'ひんやり', 'キンキン'],
      crispy: ['サクサク', 'カリカリ', 'パリパリ', 'クリスピー'],
      soft: ['柔らかい', 'やわらか', 'ふわふわ', 'とろとろ', 'もちもち'],
      fresh: ['新鮮', 'フレッシュ', 'みずみずしい', 'シャキシャキ']
    };
  }

  /**
   * 口コミリストを解析してスコアリング
   * @param {Array} reviews - 口コミ配列 [{text: string, rating: number}]
   * @param {Object} userPreferences - ユーザーの好み・気分
   * @returns {Object} スコア・理由・詳細分析
   */
  analyzeReviews(reviews, userPreferences) {
    if (!reviews || reviews.length === 0) {
      return {
        score: 0,
        reason: '口コミ情報が不足しています',
        details: null
      };
    }

    // 各口コミを分析
    const reviewAnalysis = reviews.map(review => 
      this.analyzeSingleReview(review, userPreferences)
    );

    // 総合スコア計算
    const totalScore = this.calculateTotalScore(reviewAnalysis, userPreferences);
    const reason = this.generateReason(reviewAnalysis, userPreferences);
    
    return {
      score: Math.max(0, Math.min(10, totalScore)), // 0-10に正規化
      reason,
      details: {
        reviews: reviewAnalysis,
        averageRating: this.calculateAverageRating(reviews),
        keywordMatches: this.getKeywordMatches(reviewAnalysis),
        confidence: this.calculateConfidence(reviewAnalysis)
      }
    };
  }

  /**
   * 単一口コミの分析
   */
  analyzeSingleReview(review, userPreferences) {
    const text = review.text || '';
    const rating = review.rating || 0;
    
    return {
      originalRating: rating,
      positiveScore: this.calculatePositiveScore(text),
      negativeScore: this.calculateNegativeScore(text),
      textureMatches: this.findTextureMatches(text, userPreferences),
      moodMatches: this.findMoodMatches(text, userPreferences),
      keywordDensity: this.calculateKeywordDensity(text),
      length: text.length
    };
  }

  /**
   * ポジティブスコア計算
   */
  calculatePositiveScore(text) {
    let score = 0;
    const matches = [];
    
    Object.entries(this.positiveKeywords).forEach(([category, data]) => {
      data.keywords.forEach(keyword => {
        const count = (text.split(keyword).length - 1);
        if (count > 0) {
          score += count * data.weight;
          matches.push({ keyword, category, count, weight: data.weight });
        }
      });
    });
    
    return { score, matches };
  }

  /**
   * ネガティブスコア計算
   */
  calculateNegativeScore(text) {
    let score = 0;
    const matches = [];
    
    Object.entries(this.negativeKeywords).forEach(([category, data]) => {
      data.keywords.forEach(keyword => {
        const count = (text.split(keyword).length - 1);
        if (count > 0) {
          score += count * data.weight; // 負の値
          matches.push({ keyword, category, count, weight: data.weight });
        }
      });
    });
    
    return { score, matches };
  }

  /**
   * 食感・温度マッチング
   */
  findTextureMatches(text, userPreferences) {
    const matches = [];
    const desiredTextures = userPreferences.desired_keywords || [];
    
    Object.entries(this.textureKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          // ユーザーの希望と一致するかチェック
          const isDesired = desiredTextures.some(d => 
            d.category === category || d.keyword === keyword
          );
          
          matches.push({
            keyword,
            category,
            isDesired,
            weight: isDesired ? 1.5 : 0.5
          });
        }
      });
    });
    
    return matches;
  }

  /**
   * 気分マッチング
   */
  findMoodMatches(text, userPreferences) {
    const matches = [];
    const userMoods = userPreferences.mood || [];
    
    // 気分に関連するキーワードを検索
    const moodKeywords = {
      comfort: ['ほっとする', '癒される', '安らぐ', '懐かしい', '温かみ'],
      energy: ['元気になる', 'パワーが出る', '活力', 'エネルギー', '疲れが取れる'],
      celebration: ['特別感', '贅沢', 'ご褒美', '記念', 'おめでたい']
    };
    
    userMoods.forEach(userMood => {
      const keywords = moodKeywords[userMood.mood] || [];
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          matches.push({
            keyword,
            mood: userMood.mood,
            weight: 1.3
          });
        }
      });
    });
    
    return matches;
  }

  /**
   * キーワード密度計算
   */
  calculateKeywordDensity(text) {
    if (text.length === 0) return 0;
    
    let keywordCount = 0;
    const allKeywords = [
      ...Object.values(this.positiveKeywords).flatMap(d => d.keywords),
      ...Object.values(this.negativeKeywords).flatMap(d => d.keywords)
    ];
    
    allKeywords.forEach(keyword => {
      keywordCount += (text.split(keyword).length - 1);
    });
    
    return keywordCount / text.length * 100; // パーセンテージ
  }

  /**
   * 総合スコア計算
   */
  calculateTotalScore(reviewAnalysis, userPreferences) {
    if (reviewAnalysis.length === 0) return 0;
    
    let totalScore = 0;
    let weightSum = 0;
    
    reviewAnalysis.forEach(analysis => {
      // 基本スコア
      let reviewScore = analysis.originalRating || 3; // デフォルト3.0
      
      // ポジティブ/ネガティブ調整
      reviewScore += analysis.positiveScore.score * 0.3;
      reviewScore += analysis.negativeScore.score * 0.3;
      
      // 食感・気分マッチングボーナス
      const textureBonus = analysis.textureMatches
        .filter(m => m.isDesired)
        .reduce((sum, m) => sum + m.weight, 0);
      
      const moodBonus = analysis.moodMatches
        .reduce((sum, m) => sum + m.weight, 0);
      
      reviewScore += (textureBonus + moodBonus) * 0.5;
      
      // 口コミの長さによる重み付け（長いほど信頼性高い）
      const lengthWeight = Math.min(analysis.length / 100, 2.0);
      
      totalScore += reviewScore * lengthWeight;
      weightSum += lengthWeight;
    });
    
    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  /**
   * 理由生成
   */
  generateReason(reviewAnalysis, userPreferences) {
    const reasons = [];
    
    // 評価の特徴を分析
    const avgRating = reviewAnalysis.reduce((sum, a) => 
      sum + (a.originalRating || 0), 0) / reviewAnalysis.length;
    
    if (avgRating >= 4.0) {
      reasons.push('高評価の口コミが多い');
    }
    
    // ポジティブキーワードの多さ
    const totalPositiveMatches = reviewAnalysis.reduce((sum, a) => 
      sum + a.positiveScore.matches.length, 0);
    
    if (totalPositiveMatches >= 3) {
      reasons.push('味や雰囲気の評価が高い');
    }
    
    // ユーザー好みとのマッチング
    const textureMatches = reviewAnalysis.reduce((sum, a) => 
      sum + a.textureMatches.filter(m => m.isDesired).length, 0);
    
    if (textureMatches > 0) {
      reasons.push('あなたの好みの食感・温度感にマッチ');
    }
    
    const moodMatches = reviewAnalysis.reduce((sum, a) => 
      sum + a.moodMatches.length, 0);
    
    if (moodMatches > 0) {
      reasons.push('今の気分にぴったりの雰囲気');
    }
    
    // ネガティブ要素のチェック
    const totalNegativeMatches = reviewAnalysis.reduce((sum, a) => 
      sum + Math.abs(a.negativeScore.score), 0);
    
    if (totalNegativeMatches > 2) {
      reasons.push('一部で気になる評価あり');
    }
    
    return reasons.length > 0 ? reasons.join('、') : '口コミ情報から総合的に判断';
  }

  /**
   * 平均評価計算
   */
  calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return sum / reviews.length;
  }

  /**
   * キーワードマッチ統計
   */
  getKeywordMatches(reviewAnalysis) {
    const matches = {
      positive: {},
      negative: {},
      texture: {},
      mood: {}
    };
    
    reviewAnalysis.forEach(analysis => {
      // ポジティブキーワード集計
      analysis.positiveScore.matches.forEach(match => {
        matches.positive[match.keyword] = 
          (matches.positive[match.keyword] || 0) + match.count;
      });
      
      // ネガティブキーワード集計
      analysis.negativeScore.matches.forEach(match => {
        matches.negative[match.keyword] = 
          (matches.negative[match.keyword] || 0) + match.count;
      });
      
      // 食感キーワード集計
      analysis.textureMatches.forEach(match => {
        matches.texture[match.keyword] = 
          (matches.texture[match.keyword] || 0) + 1;
      });
      
      // 気分キーワード集計
      analysis.moodMatches.forEach(match => {
        matches.mood[match.keyword] = 
          (matches.mood[match.keyword] || 0) + 1;
      });
    });
    
    return matches;
  }

  /**
   * 信頼度スコア計算
   */
  calculateConfidence(reviewAnalysis) {
    if (reviewAnalysis.length === 0) return 0;
    
    // 口コミ数による信頼度
    const countFactor = Math.min(reviewAnalysis.length / 5, 1.0);
    
    // 口コミの長さによる信頼度
    const avgLength = reviewAnalysis.reduce((sum, a) => 
      sum + a.length, 0) / reviewAnalysis.length;
    const lengthFactor = Math.min(avgLength / 50, 1.0);
    
    // キーワード密度による信頼度
    const avgDensity = reviewAnalysis.reduce((sum, a) => 
      sum + a.keywordDensity, 0) / reviewAnalysis.length;
    const densityFactor = Math.min(avgDensity / 5, 1.0);
    
    return (countFactor + lengthFactor + densityFactor) / 3;
  }
} 