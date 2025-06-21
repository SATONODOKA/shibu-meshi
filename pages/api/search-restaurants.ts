import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  searchNearbyRestaurants, 
  getPlaceDetails, 
  getPhotoUrl, 
  calculateDistance,
  genreMapping,
  moodKeywordMapping 
} from '@/lib/googleMaps'
import type { Restaurant, MoodAnalysis, Location, SearchResponse } from '@/types'

interface SearchRestaurantsRequest {
  analysis: MoodAnalysis
  location: Location
  radius?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { analysis, location, radius = 2000 }: SearchRestaurantsRequest = req.body

    if (!analysis || !location) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 気分に基づいたキーワードを生成
    const keywords = generateSearchKeywords(analysis)
    
    // Google Places APIで検索
    const searchResults = await searchNearbyRestaurants({
      location: `${location.lat},${location.lng}`,
      radius,
      keyword: keywords.join(' '),
      language: 'ja'
    })

    if (!searchResults.results || searchResults.results.length === 0) {
      return res.status(200).json({
        restaurants: [],
        analysis,
        totalCount: 0
      })
    }

    // 詳細情報を取得してスコアリング
    const restaurants: Restaurant[] = []
    
    for (const place of searchResults.results.slice(0, 20)) { // 最大20件を詳細取得
      try {
        const details = await getPlaceDetails(place.place_id)
        
        if (details.result) {
          const restaurant = mapPlaceToRestaurant(details.result, location, analysis)
          restaurants.push(restaurant)
        }
      } catch (error) {
        console.error(`Failed to get details for place ${place.place_id}:`, error)
        // エラーが発生した場合はスキップして続行
      }
    }

    // スコアリングと並び替え
    const scoredRestaurants = restaurants
      .map(restaurant => ({
        ...restaurant,
        score: calculateMatchScore(restaurant, analysis)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // 上位10件
      .map(({ score, ...restaurant }) => restaurant) // スコアは除外

    res.status(200).json({
      restaurants: scoredRestaurants,
      analysis,
      totalCount: restaurants.length
    })

  } catch (error) {
    console.error('Restaurant search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 気分に基づいた検索キーワードを生成
function generateSearchKeywords(analysis: MoodAnalysis): string[] {
  const keywords: string[] = []

  // ジャンルベースのキーワード
  if (analysis.genres && analysis.genres.length > 0) {
    keywords.push(...analysis.genres)
  }

  // 気分ベースのキーワード
  if (analysis.mood && moodKeywordMapping[analysis.mood]) {
    keywords.push(...moodKeywordMapping[analysis.mood])
  }

  // 雰囲気ベースのキーワード
  if (analysis.atmosphere) {
    keywords.push(analysis.atmosphere)
  }

  // 温度ベースのキーワード
  if (analysis.temperature) {
    keywords.push(analysis.temperature)
  }

  return keywords.slice(0, 5) // 最大5個のキーワード
}

// Google Places APIの結果をRestaurant型にマッピング
function mapPlaceToRestaurant(
  place: any, 
  userLocation: Location, 
  analysis: MoodAnalysis
): Restaurant {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    place.geometry.location.lat,
    place.geometry.location.lng
  )

  const photoUrl = place.photos && place.photos.length > 0 
    ? getPhotoUrl(place.photos[0].photo_reference, 400)
    : undefined

  const genres = extractGenres(place.types)
  const matchReason = generateMatchReason(analysis, genres, place.rating)

  return {
    id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    rating: place.rating || 0,
    priceLevel: place.price_level || 2,
    photoUrl,
    distance: Math.round(distance),
    genres,
    atmosphere: extractAtmosphere(place),
    description: place.editorial_summary?.overview || '',
    matchReason,
    reviewCount: place.user_ratings_total,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    }
  }
}

// Google Places typesから日本語ジャンルを抽出
function extractGenres(types: string[]): string[] {
  const genres: string[] = []
  
  for (const [genre, googleTypes] of Object.entries(genreMapping)) {
    if (googleTypes.some(type => types.includes(type))) {
      genres.push(genre)
    }
  }

  return genres.length > 0 ? genres : ['レストラン']
}

// 雰囲気を推定
function extractAtmosphere(place: any): string {
  const rating = place.rating || 0
  const priceLevel = place.price_level || 2

  if (priceLevel >= 4) return '高級'
  if (priceLevel <= 1) return 'カジュアル'
  if (rating >= 4.5) return '評判の良い'
  if (rating >= 4.0) return '人気の'
  
  return 'アットホーム'
}

// マッチ理由を生成
function generateMatchReason(
  analysis: MoodAnalysis, 
  genres: string[],
  rating: number
): string {
  const reasons: string[] = []

  if (analysis.mood) {
    switch (analysis.mood) {
      case '疲れた':
        reasons.push('疲れた時にぴったりの優しい味')
        break
      case 'お祝い':
        reasons.push('特別な日にふさわしい雰囲気')
        break
      case '友達と':
        reasons.push('友達とシェアして楽しめる')
        break
    }
  }

  if (analysis.temperature) {
    reasons.push(`${analysis.temperature}料理でほっとできる`)
  }

  if (genres.length > 0) {
    reasons.push(`${genres[0]}で気分にマッチ`)
  }

  if (rating >= 4.0) {
    reasons.push(`評価${rating}の人気店`)
  }

  return reasons.join('、') || 'あなたの気分にぴったり'
}

// マッチスコアを計算
function calculateMatchScore(restaurant: Restaurant, analysis: MoodAnalysis): number {
  let score = 0

  // 基本評価スコア
  score += restaurant.rating * 10

  // ジャンルマッチ
  if (analysis.genres && analysis.genres.length > 0) {
    const genreMatch = restaurant.genres.some(genre => 
      analysis.genres.includes(genre)
    )
    if (genreMatch) score += 20
  }

  // 気分マッチ
  if (analysis.mood && moodKeywordMapping[analysis.mood]) {
    const moodKeywords = moodKeywordMapping[analysis.mood]
    const nameMatch = moodKeywords.some(keyword => 
      restaurant.name.includes(keyword) || 
      restaurant.description?.includes(keyword)
    )
    if (nameMatch) score += 15
  }

  // 距離スコア（近いほど高スコア）
  if (restaurant.distance) {
    score += Math.max(0, 10 - (restaurant.distance / 200))
  }

  // 価格レベル調整
  if (analysis.mood === 'お祝い' && restaurant.priceLevel >= 3) {
    score += 10
  } else if (analysis.appetite === '軽め' && restaurant.priceLevel <= 2) {
    score += 5
  }

  return score
} 