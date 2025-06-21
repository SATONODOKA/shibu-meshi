'use client'

interface QuickMoodButtonsProps {
  onMoodSelect: (mood: string) => void
}

const quickMoods = [
  { text: '疲れた', emoji: '😴', mood: '疲れていて癒されたい。温かくて優しい味のものが食べたい。' },
  { text: 'お祝い', emoji: '🎉', mood: '特別な日なので、ちょっと背伸びした素敵なお店で食事したい。' },
  { text: '友達と', emoji: '👥', mood: '友達と楽しく食事したい。みんなでシェアできるような料理がいい。' },
  { text: 'さっぱり', emoji: '🥗', mood: 'さっぱりしたものが食べたい。野菜多めで軽やかな料理がいい。' },
  { text: 'がっつり', emoji: '🍖', mood: 'お腹がすいてがっつり食べたい。ボリューム満点の料理が欲しい。' },
  { text: 'デート', emoji: '💕', mood: 'デートで使えるおしゃれで雰囲気の良いお店を探している。' },
  { text: '一人時間', emoji: '☕', mood: '一人でゆっくり過ごしたい。静かで落ち着ける場所がいい。' },
  { text: '新しい挑戦', emoji: '✨', mood: '今まで食べたことのない新しい料理に挑戦してみたい。' }
]

export function QuickMoodButtons({ onMoodSelect }: QuickMoodButtonsProps) {
  return (
    <div className="mb-8">
      <p className="text-gray-600 mb-4 text-center">
        または、よくある気分から選んでください：
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {quickMoods.map((item, index) => (
          <button
            key={index}
            onClick={() => onMoodSelect(item.mood)}
            className="bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-xl p-4 transition-all duration-200 transform hover:scale-105 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
              {item.emoji}
            </div>
            <div className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
              {item.text}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
} 