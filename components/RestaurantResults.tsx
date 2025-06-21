'use client'

import { useState } from 'react'
import { Star, MapPin, Clock, DollarSign, Heart, RotateCcw, ExternalLink, Phone } from 'lucide-react'
import type { Restaurant, MoodAnalysis } from '@/types'

interface RestaurantResultsProps {
  restaurants: Restaurant[]
  moodAnalysis: MoodAnalysis | null
  onReset: () => void
}

export function RestaurantResults({ restaurants, moodAnalysis, onReset }: RestaurantResultsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (restaurantId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId)
    } else {
      newFavorites.add(restaurantId)
    }
    setFavorites(newFavorites)
  }

  const getPriceDisplay = (priceLevel: number) => {
    return '¥'.repeat(priceLevel) + '￥'.repeat(4 - priceLevel)
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return ''
    if (distance < 1000) {
      return `${Math.round(distance)}m`
    }
    return `${(distance / 1000).toFixed(1)}km`
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          お店が見つかりませんでした
        </h3>
        <p className="text-gray-600 mb-6">
          条件を変えて再度検索してみてください
        </p>
        <button onClick={onReset} className="btn-primary">
          もう一度検索する
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            おすすめのお店
          </h2>
          <button
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="最初からやり直す"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        
        {moodAnalysis && (
          <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-primary-800 mb-2">あなたの気分分析結果:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {moodAnalysis.cuisine_types && moodAnalysis.cuisine_types.length > 0 && (
                <div><span className="text-gray-600">料理タイプ:</span> <span className="font-medium">{moodAnalysis.cuisine_types.join(', ')}</span></div>
              )}
              {moodAnalysis.dining_style && (
                <div><span className="text-gray-600">スタイル:</span> <span className="font-medium">{moodAnalysis.dining_style}</span></div>
              )}
              {moodAnalysis.price_range && (
                <div><span className="text-gray-600">価格帯:</span> <span className="font-medium">{moodAnalysis.price_range}</span></div>
              )}
              {moodAnalysis.atmosphere && (
                <div><span className="text-gray-600">雰囲気:</span> <span className="font-medium">{moodAnalysis.atmosphere}</span></div>
              )}
            </div>
          </div>
        )}
        
        <p className="text-gray-600">
          {restaurants.length}件のお店を見つけました
        </p>
      </div>

      {/* レストランリスト */}
      <div className="space-y-6">
        {restaurants.map((restaurant, index) => (
          <div key={restaurant.id} className="restaurant-card group">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 画像 */}
              <div className="md:w-48 md:h-32 w-full h-48 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                {restaurant.photos && restaurant.photos.length > 0 ? (
                  <img
                    src={restaurant.photos[0]}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {restaurant.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* ランキングバッジ */}
                <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-primary-600">
                  {index + 1}
                </div>
                
                {/* お気に入りボタン */}
                <button
                  onClick={() => toggleFavorite(restaurant.id)}
                  className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-100 transition-all"
                >
                  <Heart 
                    className={`w-4 h-4 ${favorites.has(restaurant.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                  />
                </button>
              </div>

              {/* 詳細情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800 truncate mr-4">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-700">{restaurant.rating || 'N/A'}</span>
                    {restaurant.user_ratings_total && (
                      <span className="text-gray-500 text-sm">({restaurant.user_ratings_total})</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{formatDistance(restaurant.distance)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-mono">{getPriceDisplay(restaurant.price_level || 0)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {[restaurant.cuisine, restaurant.amenity].filter(Boolean).slice(0, 3).map((genre, idx) => (
                      <span 
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {restaurant.formatted_address || `緯度: ${restaurant.lat}, 経度: ${restaurant.lon}`}
                </p>

                {restaurant.score && (
                  <div className="bg-primary-50 rounded-lg p-3 mb-4">
                    <p className="text-primary-800 text-sm font-medium mb-1">
                      マッチ度
                    </p>
                    <p className="text-primary-700 text-sm leading-relaxed">
                      スコア: {restaurant.score}/100
                    </p>
                  </div>
                )}

                {restaurant.tags && Object.keys(restaurant.tags).length > 0 && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    <span className="font-medium">詳細:</span> {Object.entries(restaurant.tags).slice(0, 3).map(([key, value]) => `${key}: ${value}`).join(', ')}
                  </p>
                )}

                {/* アクションボタン */}
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary text-sm py-2 px-4">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    詳細を見る
                  </button>
                  <button className="btn-secondary text-sm py-2 px-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    地図で見る
                  </button>
                  <button className="btn-secondary text-sm py-2 px-4">
                    <Phone className="w-4 h-4 mr-2" />
                    電話する
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 追加検索ボタン */}
      <div className="text-center mt-12">
        <button
          onClick={onReset}
          className="btn-secondary"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          別の気分で検索する
        </button>
      </div>
    </div>
  )
} 