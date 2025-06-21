# 🍽 渋メシ v2.0

**気分でみつける、あなたのお店**

今の気分を自然文で入力するだけで、AIがあなたにぴったりの飲食店を推薦します。検索ではなく、対話から始まる新しいグルメ体験。

## ✨ 特徴

### 🤖 ローカルAI気分分析
- **Qwen3ローカル実行**: OpenAIを使わず、プライベートで高速な気分分析
- **自然文理解**: 「疲れてて温かいものが欲しい」などの曖昧な表現も理解
- **対話形式**: 必要に応じて追加質問で詳細な好みを把握

### 🌍 オープンデータ活用
- **OpenStreetMap**: 完全無料で無制限の店舗データ
- **Overpass API**: 複雑な検索クエリと豊富な飲食店情報
- **コスト0**: APIキー不要、利用制限なし

### 💫 モダンなUX
- **レスポンシブデザイン**: スマホ・タブレット・PC完全対応
- **美しいUI**: Tailwind CSSによる洗練されたデザイン
- **直感的操作**: クイック気分選択とフリーテキストの両方をサポート

## 🚀 技術スタック v2.0

### フロントエンド
- **Next.js 14**: App Router、Server Components
- **React 18**: Hooks、TypeScript完全対応
- **Tailwind CSS**: ユーティリティファースト、レスポンシブ
- **Framer Motion**: スムーズなアニメーション

### バックエンド・AI
- **Qwen3 (ローカル)**: Alibaba製オープンソースLLM
- **Ollama**: ローカルAI実行エンジン
- **Node.js**: Next.js API Routes

### データソース（無料）
- **OpenStreetMap**: 世界最大のオープン地図データ
- **Overpass API**: 高速な地理空間クエリエンジン
- **Nominatim**: 住所ジオコーディング

## 🛠 セットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Ollamaがインストール済み
- Qwen3モデルがダウンロード済み

### 1. Ollamaのインストール

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# https://ollama.com/download からダウンロード
```

### 2. Qwen3モデルの取得

```bash
# 推奨：バランス型4Bモデル
ollama pull qwen3:4b

# 軽量版（低スペック環境向け）
ollama pull qwen3:1.7b

# 高性能版（高スペック環境向け）
ollama pull qwen3:8b
```

### 3. プロジェクトセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/shibu-meshi.git
cd shibu-meshi

# 依存関係をインストール
npm install

# 環境変数を設定（任意）
cp .env.example .env.local
```

### 4. 環境変数設定（任意）

`.env.local`ファイルで以下をカスタマイズ可能：

```bash
# Ollama設定（デフォルト値）
OLLAMA_BASE_URL=http://localhost:11434
QWEN3_MODEL=qwen3:4b

# アプリ設定
NEXT_PUBLIC_APP_NAME=渋メシ
NEXT_PUBLIC_DEFAULT_LOCATION=東京都渋谷区
```

### 5. 開発サーバー起動

```bash
# Ollamaサーバーを起動
ollama serve

# 別ターミナルでNext.jsアプリを起動
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認してください。

## 📱 使い方

1. **気分を入力**: 今の気分や食べたいものを自然な言葉で入力
2. **位置情報許可**: 近くのお店を見つけるために位置情報を許可
3. **対話で詳細化**: 必要に応じてAIが追加質問
4. **お店を発見**: あなたにぴったりのお店が表示されます

### 入力例

```
✅ 良い例:
"疲れてて温かいものが欲しい"
"映画の後でちょっと特別な気分"
"友達と楽しく食べたい"
"お祝い用の素敵なお店を探してる"

📝 対応する気分:
- 疲れた / リラックス / 癒し
- お祝い / 特別 / 記念日
- 友達と / デート / 一人時間
- がっつり / さっぱり / 軽め
```

## 🏗️ プロジェクト構造

```
shibu-meshi/
├── app/                    # Next.js App Router
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   ├── MoodInput.tsx      # 気分入力フォーム
│   ├── ChatInterface.tsx  # チャット画面
│   ├── RestaurantResults.tsx # 結果表示
│   └── ...
├── lib/                   # ライブラリ
│   ├── qwen3.ts          # Qwen3ローカルAPI
│   └── overpass.ts       # OpenStreetMap/Overpass API
├── pages/api/            # APIルート
│   ├── analyze-mood-qwen3.ts   # 気分分析API
│   ├── search-restaurants-osm.ts # 店舗検索API
│   └── chat-qwen3.ts           # チャット処理API
├── types/                # TypeScript型定義
│   └── index.ts
└── public/               # 静的ファイル
```

## 🔧 API エンドポイント

### POST /api/analyze-mood-qwen3
Qwen3で気分を分析して料理ジャンルや雰囲気を抽出

### POST /api/search-restaurants-osm
OpenStreetMapで分析結果に基づく飲食店検索

### POST /api/chat-qwen3
Qwen3による対話形式での追加情報収集

## 💡 Qwen3モデル比較

| モデル | サイズ | メモリ使用量 | 処理速度 | 品質 | 推奨用途 |
|--------|--------|-------------|----------|------|----------|
| qwen3:0.6b | 0.6B | ~1GB | 最高速 | 基本 | 低スペック・テスト用 |
| qwen3:1.7b | 1.7B | ~2GB | 高速 | 良好 | ノートPC・軽量運用 |
| qwen3:4b | 4B | ~4GB | 中速 | 高品質 | **推奨・バランス型** |
| qwen3:8b | 8B | ~8GB | 中速 | 最高品質 | 高性能PC・本格運用 |

## 🌟 v2.0の改善点

### ✅ コスト削減
- **OpenAI API**: 削除（$0.002/1Kトークン → 完全無料）
- **Google Maps API**: 削除（$200無料枠/月 → 完全無料）
- **運用コスト**: 月額数千円 → **完全無料**

### ✅ プライバシー強化
- **データ外部送信**: なし（すべてローカル処理）
- **API利用制限**: なし
- **データ保持**: ユーザー完全制御

### ✅ 性能向上
- **レスポンス速度**: ローカル処理で高速化
- **オフライン対応**: ネットワーク不安定でも動作
- **カスタマイズ性**: モデル・パラメータ自由調整

### ✅ バグ修正・安定性向上
- **JSONパースエラー修正**: Qwen3のthinkingタグ処理を改善
- **データ構造統一**: OpenStreetMapとGoogle Maps APIの互換性を確保
- **エラーハンドリング強化**: 位置情報処理とレストラン検索の安定化
- **UI表示修正**: プロパティ不一致によるランタイムエラーを解決

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. 「レストラン検索に失敗した」エラー
```bash
# Ollamaサーバーが起動しているか確認
ollama serve

# Qwen3モデルがインストールされているか確認
ollama list

# 位置情報が正しく取得されているか確認（ブラウザの開発者ツールで確認）
```

#### 2. JSONパースエラー
```bash
# Ollamaを最新版に更新
brew upgrade ollama

# Ollamaサーバーを再起動
brew services restart ollama
```

#### 3. Next.jsコンパイルエラー
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# 開発サーバーを再起動
npm run dev
```

#### 4. 位置情報が取得できない
- ブラウザの位置情報許可を確認
- HTTPSでアクセスしているか確認（本番環境）
- ブラウザの設定で位置情報が有効になっているか確認

## 🤝 コントリビューション

1. Forkしてブランチを作成
2. 機能追加・バグ修正を実装
3. テストを実行
4. Pull Requestを作成

## 📄ライセンス

MIT License

## 🙋‍♂️ サポート

質問やバグ報告は [Issues](https://github.com/yourusername/shibu-meshi/issues) までお願いします。

---

**🍽 渋メシ v2.0** - 完全無料でプライベートな気分グルメマッチング 