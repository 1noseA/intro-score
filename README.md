# intro-score
AI音声分析による自己紹介スキル向上支援アプリ

コミュニティ「おだいで.dev」#1 自己紹介 で作成

**🔗 URL:** https://intro-score.vercel.app/  
※認証機能・DB機能はないため個人情報や入力情報は保存されず、安心してお試しいただけます。

## 目的
- ClaudeCodeの実力を知る（要件定義から作成、ALL ClaudeCode製）
- 使ってみたかった技術を試す（Next.js, TypeScript, TailwindCSS）
- 社内のAI勉強会にて紹介された音声入力/文字起こし/AI評価のアプリを作ってみたい

## 概要
エンジニアの自己紹介音声を分析し、カスタムAI人格による「仲良くなりたい度」「一緒に働きたい度」を評価することで、社内外コミュニケーション能力向上を支援するアプリケーション。

## 機能一覧
- 🎤 **音声録音・処理**: ブラウザでの音声録音と自動文字起こし
- 🎵 **音声分析**: 音量/高低/話速/明瞭性/安定性/印象の分析
- 🤖 **AI評価**: カスタムAI人格による個人向け評価
- 📱 **Xプロフィール生成**

## 技術スタック
- **フロントエンド**: Next.js 14, TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes
- **AI**: Google Gemini API
- **音声処理**: Web Speech API, Web Audio API
- **デプロイ**: Vercel

## 開発環境セットアップ
```bash
git clone https://github.com/your-username/intro-score.git
cd intro-score
npm install
# .env.localにGEMINI_API_KEYを設定
npm run dev  # http://localhost:3000
```

## ディレクトリ構成
```
intro-score/
├── docs/
│   ├── api-specification.md # API仕様書
│   └── requirements.md      # 要件定義書
├── src/
│   ├── app/
│   │   ├── api/             # API Routes
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # メインページ
│   ├── components/          # 音声録音・AI評価コンポーネント
│   └── types/               # TypeScript型定義
├── CLAUDE.md                # Claude Code用の開発ガイド
├── next.config.js           # Next.js設定
├── package.json             # パッケージ情報
└── tailwind.config.js       # TailwindCSS設定
```

## アプリ画像
<img width="2880" height="5806" alt="Image" src="https://github.com/user-attachments/assets/4a5e3161-367d-420e-b4f3-5c8f95432cbf" />
