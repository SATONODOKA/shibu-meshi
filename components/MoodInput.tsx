'use client'

import { useState } from 'react'
import { Send, MapPin } from 'lucide-react'

interface MoodInputProps {
  onSubmit: (mood: string) => void
  hasLocation: boolean
  isLoading: boolean
}

export function MoodInput({ onSubmit, hasLocation, isLoading }: MoodInputProps) {
  const [mood, setMood] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mood.trim() && !isLoading) {
      onSubmit(mood.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin 
            className={`w-5 h-5 ${hasLocation ? 'text-green-500' : 'text-gray-400'}`} 
          />
          <span className={`text-sm ${hasLocation ? 'text-green-600' : 'text-gray-500'}`}>
            {hasLocation ? '位置情報取得済み' : '位置情報が必要です'}
          </span>
        </div>
        
        <div className="relative">
          <textarea
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="今の気分を教えてください...&#10;例：「疲れてて温かいものが欲しい」「映画の後でちょっと特別な気分」「友達と楽しく食べたい」"
            className="w-full px-6 py-4 pr-16 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-lg resize-none"
            rows={4}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!mood.trim() || isLoading}
            className="absolute bottom-4 right-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-gray-500 text-sm">
          自然な言葉で気分を表現してください。AIがあなたの気持ちを理解します。
        </p>
      </div>
    </form>
  )
} 