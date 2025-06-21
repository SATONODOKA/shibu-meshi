'use client'

import { Loader2, Search, MessageCircle, MapPin } from 'lucide-react'

const loadingSteps = [
  { icon: MessageCircle, text: '気分を分析中...' },
  { icon: Search, text: 'お店を検索中...' },
  { icon: MapPin, text: '最適なお店を選定中...' }
]

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative">
        {/* メインスピナー */}
        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        
        {/* 装飾的なリング */}
        <div className="absolute inset-0 w-20 h-20 border-4 border-primary-200 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-2 w-16 h-16 border-2 border-primary-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <div className="space-y-4 max-w-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          あなたにぴったりのお店を探しています
        </h3>
        
        {loadingSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 text-gray-600 animate-fade-in"
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            <step.icon className="w-5 h-5 text-primary-500" />
            <span>{step.text}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>少々お待ちください...</p>
      </div>
    </div>
  )
} 