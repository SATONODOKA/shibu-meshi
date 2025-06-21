'use client'

import { MapPin, X } from 'lucide-react'

interface LocationPromptProps {
  onAllow: () => void
  onDeny: () => void
}

export function LocationPrompt({ onAllow, onDeny }: LocationPromptProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slide-up">
        <button
          onClick={onDeny}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary-500" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            位置情報の許可が必要です
          </h3>
          
          <p className="text-gray-600 mb-6">
            あなたの現在地周辺の飲食店を探すために、位置情報の利用を許可してください。
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onAllow}
              className="w-full btn-primary"
            >
              位置情報を許可する
            </button>
            
            <button
              onClick={onDeny}
              className="w-full btn-secondary"
            >
              後で設定する
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            位置情報は検索にのみ使用され、保存されません。
          </p>
        </div>
      </div>
    </div>
  )
} 