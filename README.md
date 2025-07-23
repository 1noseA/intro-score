# intro-score

AI音声分析による自己紹介スキル向上プラットフォーム

## 概要

intro-scoreは、エンジニアの自己紹介音声を分析し、カスタムAI人格による「仲良くなりたい度」「一緒に働きたい度」を評価することで、社内外コミュニケーション能力向上を支援するアプリケーションです。

## 主な機能

- 🎤 **音声録音・処理**: ブラウザでの音声録音と自動文字起こし
- 🎵 **音響分析**: 声質、音量、話速、安定性の分析
- 🤖 **AI評価**: カスタムAI人格による個人向け評価
- 👨‍💻 **エンジニア特化**: 技術スキル抽出とプロフィール生成
- 📱 **プラットフォーム対応**: Twitter、Instagram、note、技術ブログ向け自己紹介生成

## 技術スタック

- **フロントエンド**: Next.js 14, TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth
- **AI**: Google Gemini API
- **音声処理**: Web Speech API, Web Audio API
- **デプロイ**: Vercel

## 開発環境のセットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn

### インストール

1. リポジトリをクローン
\`\`\`bash
git clone <repository-url>
cd intro-score
\`\`\`

2. 依存関係をインストール
\`\`\`bash
npm install
\`\`\`

3. 環境変数を設定
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

環境変数を適切に設定してください：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー
- `GEMINI_API_KEY`: Google Gemini APIキー

4. 開発サーバーを起動
\`\`\`bash
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## スクリプト

- `npm run dev`: 開発サーバーを起動
- `npm run build`: プロダクションビルドを作成
- `npm run start`: プロダクションサーバーを起動
- `npm run lint`: ESLintでコードをチェック
- `npm run type-check`: TypeScriptの型チェックを実行

## プロジェクト構造

\`\`\`
src/
├── app/                 # Next.js App Router
├── components/          # Reactコンポーネント
├── hooks/              # カスタムフック
├── lib/                # ライブラリとユーティリティ
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
\`\`\`

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。