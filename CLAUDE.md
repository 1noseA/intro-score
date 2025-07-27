# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**intro-score** は、エンジニアの自己紹介スキル向上を支援するAI音声分析アプリケーションです。音声録音、音響分析、カスタムAI人格による評価を通じて「仲良くなりたい度」「一緒に働きたい度」の2軸で評価を行います。

## 技術アーキテクチャ

### コア技術スタック
- **フロントエンド**: Next.js 14+ (App Router), TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase PostgreSQL + Row Level Security (RLS)
- **認証**: Supabase Auth
- **ファイルストレージ**: Supabase Storage
- **AI処理**: Google Gemini API（無料枠）
- **音声処理**: Web Speech API + Web Audio API
- **デプロイ**: Vercel

### 設計原則
- **完全無料枠運用**: 全サービスを無料利用枠内で動作
- **ブラウザファースト**: 音声処理はネイティブブラウザAPI使用（MediaRecorder, Web Speech, Web Audio）
- **ローカル処理**: 認証なしで詰めが使えるシンプルアプリ
- **AI駆動評価**: プリセットAI人格によるパーソナライズされたフィードバック
- **エンジニア特化**: 技術スキル抽出とプラットフォーム別出力生成

## データアーキテクチャ

### データフロー
1. **音声録音** → MediaRecorder API → ローカル処理
2. **文字起こし** → Web Speech API → 構造化テキスト
3. **音響分析** → Web Audio API → 音響メトリクス
4. **プロフィール抽出** → Gemini API → 構造化エンジニアデータ
5. **AI評価** → プリセット人格 + Gemini API → スコア・フィードバック
6. **プロフィール生成** → 抽出データ + Gemini API → プラットフォーム最適化テキスト

## API設計

### 認証方式
なし（ローカル処理）

### 主要エンドポイント
- `/api/transcribe` - 文字起こし
- `/api/generate-x-profile` - Xプロフィール生成

### レート制限
- 一般API: 100 req/min
- ファイルアップロード: 10 req/min
- Xプロフィール生成: 3 req/min

## 開発パターン

### シンプル処理パイプライン
```
MediaRecorder → WebM blob →
Web Speech API → transcript →
Gemini API → Xプロフィール生成
```


### Xプロフィール生成戦略
- 汎用的情報抽出アプローチ（技術用語のハードコーディングなし）
- 160文字制限内での最適化
- キャッチーで魅力的な表現

### Xプロフィール最適化
- **文字数**: 160文字以内
- **コンテンツ**: 専門性+個性+キャッチーさ
- **表現**: 絵文字や記号を効果的に活用

## セキュリティ・プライバシー

### データ保護
- 音声ファイルはローカルのみで処理、サーバー保存なし
- 個人情報保護はローカル処理で実現
- 外部API呼び出しはすべて環境変数でキー管理

## 外部サービス制限

### Gemini API（無料枠）
- 15 requests/分
- 1Mトークン/日
- 用途: プロフィール抽出、AI評価、テキスト生成


### Vercel（無料枠）
- 100GB帯域幅
- Function timeout: 10s（Hobby）/ 15s（Pro）

## 実装上の重要事項

- **まだnpm/buildコマンドなし**: プロジェクトは設計フェーズ
- **音声処理はクライアント側**: サーバー負荷とAPIコスト削減、プライバシー保護
- **Gemini API統合**: レート制限をユーザーフィードバック付きで適切に処理
- **音声フォーマット標準化**: 録音はWebM、ブラウザ互換性確保
- **エラーハンドリング**: 音声許可、API障害、処理タイムアウトの包括的エラー状態


## 重要な制約事項
- 録音時間: 最大5分
- 文字起こし: リアルタイム処理
- Xプロフィール生成: 30秒以内
- 同時利用者数: 50人まで対応
- 音声ファイル: ローカル処理のみ、サーバー保存なし