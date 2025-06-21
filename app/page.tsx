'use client'

import { useState, useEffect } from 'react'
import { MoodInput } from '@/components/MoodInput'
import { ChatInterface } from '@/components/ChatInterface'
import { RestaurantResults } from '@/components/RestaurantResults'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LocationPrompt } from '@/components/LocationPrompt'
import { QuickMoodButtons } from '@/components/QuickMoodButtons'
import type { Restaurant, MoodAnalysis, ChatMessage, Location } from '@/types'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'input' | 'chat' | 'loading' | 'results'>('input')
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 位置情報の取得
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('位置情報がサポートされていません')
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      setShowLocationPrompt(false)
    } catch (error) {
      console.error('位置情報の取得に失敗:', error)
      setError('位置情報の取得に失敗しました')
    }
  }

  // 気分入力の処理
  const handleMoodSubmit = async (mood: string) => {
    if (!userLocation) {
      setShowLocationPrompt(true)
      return
    }

    setCurrentStep('loading')
    setIsLoading(true)
    setError(null)

    try {
      // 気分分析API呼び出し（Qwen3使用）
      const analysisResponse = await fetch('/api/analyze-mood-qwen3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, location: userLocation })
      })

      if (!analysisResponse.ok) {
        throw new Error('気分分析に失敗しました')
      }

      const analysisData = await analysisResponse.json()
      setMoodAnalysis(analysisData.analysis)

      // 追加質問が必要な場合
      if (analysisData.needsMoreInfo) {
        setCurrentStep('chat')
        setChatMessages([
          {
            id: '1',
            type: 'assistant',
            content: analysisData.question,
            timestamp: new Date()
          }
        ])
      } else {
        // 直接レストラン検索
        await searchRestaurants(analysisData.analysis)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('エラーが発生しました。もう一度お試しください。')
      setCurrentStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  // レストラン検索
  const searchRestaurants = async (analysis: MoodAnalysis) => {
    setCurrentStep('loading')
    setIsLoading(true)

    try {
      const searchResponse = await fetch('/api/search-restaurants-osm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodAnalysis: analysis,
          location: userLocation,
          radius: 2000 // 2km
        })
      })

      if (!searchResponse.ok) {
        throw new Error('レストラン検索に失敗しました')
      }

      const searchData = await searchResponse.json()
      setRestaurants(searchData.restaurants)
      setCurrentStep('results')
    } catch (error) {
      console.error('Error:', error)
      setError('レストラン検索に失敗しました。もう一度お試しください。')
      setCurrentStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  // チャット処理
  const handleChatSubmit = async (message: string) => {
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat-qwen3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatHistory: chatMessages
        })
      })

      if (!response.ok) {
        throw new Error('チャット処理に失敗しました')
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, assistantMessage])

      // 十分な情報が得られた場合、レストラン検索を実行
      if (data.readyToSearch) {
        await searchRestaurants(data.updatedAnalysis)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  // リセット
  const handleReset = () => {
    setCurrentStep('input')
    setRestaurants([])
    setMoodAnalysis(null)
    setChatMessages([])
    setError(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヒーローセクション */}
      {currentStep === 'input' && (
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                渋メシ
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              気分でみつける、あなたのお店
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              今の気分を教えてください。あなたの感情と現在地から、
              ぴったりの飲食店をAIが見つけます。
            </p>
          </div>
          
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
              {error}
            </div>
          )}
          
          {/* 位置情報プロンプト */}
          {showLocationPrompt && (
            <LocationPrompt
              onAllow={requestLocation}
              onDeny={() => setShowLocationPrompt(false)}
            />
          )}
          
          {/* クイック気分選択 */}
          <QuickMoodButtons onMoodSelect={handleMoodSubmit} />
          
          {/* 気分入力フォーム */}
          <MoodInput
            onSubmit={handleMoodSubmit}
            hasLocation={!!userLocation}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* チャットインターフェース */}
      {currentStep === 'chat' && (
        <ChatInterface
          messages={chatMessages}
          onSubmit={handleChatSubmit}
          isLoading={isLoading}
          onReset={handleReset}
        />
      )}

      {/* ローディング */}
      {currentStep === 'loading' && (
        <LoadingSpinner />
      )}

      {/* 結果表示 */}
      {currentStep === 'results' && (
        <RestaurantResults
          restaurants={restaurants}
          moodAnalysis={moodAnalysis}
          onReset={handleReset}
        />
      )}
    </div>
  )
} 