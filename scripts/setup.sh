#!/bin/bash

echo "🍽 渋メシ v2.0 セットアップ確認スクリプト"
echo "============================================"

# Node.js バージョン確認
echo "📦 Node.js バージョン確認..."
node_version=$(node --version 2>/dev/null || echo "未インストール")
echo "   Node.js: $node_version"

if [[ "$node_version" == "未インストール" ]]; then
    echo "❌ Node.js がインストールされていません"
    echo "   https://nodejs.org/ からインストールしてください"
    exit 1
fi

# Ollama 確認
echo ""
echo "🤖 Ollama 確認..."
ollama_version=$(ollama --version 2>/dev/null || echo "未インストール")
echo "   Ollama: $ollama_version"

if [[ "$ollama_version" == "未インストール" ]]; then
    echo "❌ Ollama がインストールされていません"
    echo "   インストール方法:"
    echo "   macOS: brew install ollama"
    echo "   Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo "   Windows: https://ollama.com/download"
    exit 1
fi

# Ollama サービス確認
echo ""
echo "🔍 Ollama サービス確認..."
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "✅ Ollama サーバーが稼働中"
else
    echo "⚠️  Ollama サーバーが起動していません"
    echo "   以下のコマンドで起動してください: ollama serve"
fi

# Qwen3 モデル確認
echo ""
echo "🧠 Qwen3 モデル確認..."
if ollama list | grep -q "qwen3"; then
    echo "✅ Qwen3 モデルが利用可能"
    ollama list | grep qwen3
else
    echo "❌ Qwen3 モデルが見つかりません"
    echo "   以下のコマンドでモデルをダウンロードしてください:"
    echo "   ollama pull qwen3:4b  # 推奨"
    echo "   ollama pull qwen3:1.7b  # 軽量版"
    echo "   ollama pull qwen3:8b   # 高性能版"
    exit 1
fi

# 依存関係確認
echo ""
echo "📚 依存関係確認..."
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo "✅ Node.js 依存関係インストール済み"
    else
        echo "⚠️  Node.js 依存関係が未インストール"
        echo "   npm install を実行してください"
    fi
else
    echo "❌ package.json が見つかりません"
    echo "   正しいディレクトリにいることを確認してください"
    exit 1
fi

# ポート確認
echo ""
echo "🔌 ポート確認..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  ポート 3000 が使用中です"
    echo "   別のアプリケーションを終了するか、別のポートを使用してください"
else
    echo "✅ ポート 3000 が利用可能"
fi

echo ""
echo "🚀 起動準備完了！"
echo "以下のコマンドでアプリを起動してください:"
echo ""
echo "1. Ollama サーバー起動（別ターミナル）:"
echo "   ollama serve"
echo ""
echo "2. 開発サーバー起動:"
echo "   npm run dev"
echo ""
echo "3. ブラウザでアクセス:"
echo "   http://localhost:3000"
echo ""
echo "📖 詳細なドキュメント: README.md" 