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
- **AI駆動評価**: カスタムAI人格によるパーソナライズされたフィードバック
- **エンジニア特化**: 技術スキル抽出とプラットフォーム別出力生成

## データアーキテクチャ

### 主要エンティティ
- **users**: Supabase Auth連携の基本ユーザー情報
- **recordings**: 音声ファイル・文字起こし・処理状態管理
- **custom_ai_personas**: ユーザー作成およびプリセットAI評価者
- **voice_analyses**: 音響分析結果（明瞭度、音量、話速、安定性）
- **evaluations**: AI人格による判定・スコア・詳細フィードバック
- **engineer_profiles**: 抽出された技術スキル・プロジェクト・個人情報
- **generated_introductions**: プラットフォーム別プロフィール文（Twitter, Instagram, note, 技術ブログ）

### データフロー
1. **音声録音** → MediaRecorder API → Supabase Storage
2. **文字起こし** → Web Speech API → 構造化テキスト
3. **音響分析** → Web Audio API → 音響メトリクス
4. **プロフィール抽出** → Gemini API → 構造化エンジニアデータ
5. **AI評価** → カスタム人格 + Gemini API → スコア・フィードバック
6. **プロフィール生成** → 抽出データ + Gemini API → プラットフォーム最適化テキスト

## API設計

### 認証方式
全APIルートでSupabase JWT トークン（`Authorization: Bearer`ヘッダー）必須

### 主要エンドポイント
- `/api/recordings/*` - 音声アップロード、文字起こし、分析
- `/api/ai-personas/*` - カスタムAI人格管理
- `/api/evaluations/*` - AI評価実行・結果取得
- `/api/recordings/{id}/profile` - エンジニアプロフィール抽出
- `/api/recordings/{id}/generate-introductions` - プラットフォーム別テキスト生成

### レート制限
- 一般API: 100 req/min/user
- AI評価: 5 req/min/user
- ファイルアップロード: 10 req/min/user
- テキスト生成: 3 req/min/user

## 開発パターン

### 音声処理パイプライン
```
MediaRecorder → WebM blob → Supabase Storage →
Web Speech API → transcript →
Web Audio API → voice metrics →
Gemini API → evaluation
```

### AI人格システム
- **カスタム人格**: ユーザー定義のフリーテキスト性格記述
- **プリセット人格**: 事前設定評価者タイプ（技術メンター、チームリーダー等）
- **評価ロジック**: 双方向スコアシステム（親しみやすさ + 仕事適合性）

### プロフィール抽出戦略
- 汎用的抽出アプローチ（技術用語のハードコーディングなし）
- 柔軟なスキル分類のためのJSONB構造化ストレージ
- ユーザー編集可能な抽出データ

### プラットフォーム生成ターゲット
- **Twitter**: 160文字、専門性+個性
- **Instagram**: 150文字、視覚的・感情的表現+絵文字
- **note**: 300-500文字、詳細なナラティブ
- **技術ブログ**: 200-400文字、技術重視

## セキュリティ・プライバシー

### データ保護
- 音声ファイルは24時間後自動削除
- Row Level Securityでユーザーデータ分離を強制
- 外部API呼び出しはすべて環境変数でキー管理

### Supabase RLSポリシー
- ユーザーは自分の録音・評価のみアクセス可能
- AI人格: 自分のカスタム + 共有プリセットが閲覧可能
- その他テーブルはuser_id所有権モデルに従う

## 外部サービス制限

### Gemini API（無料枠）
- 15 requests/分
- 1Mトークン/日
- 用途: プロフィール抽出、AI評価、テキスト生成

### Supabase（無料枠）
- 500MBデータベース
- 5GB帯域幅
- 1GBファイルストレージ

### Vercel（無料枠）
- 100GB帯域幅
- Function timeout: 10s（Hobby）/ 15s（Pro）

## 実装上の重要事項

- **まだnpm/buildコマンドなし**: プロジェクトは設計フェーズ
- **音声処理はクライアント側**: サーバー負荷とAPIコスト削減
- **Gemini API統合**: レート制限をユーザーフィードバック付きで適切に処理
- **音声フォーマット標準化**: 録音はWebM、ブラウザ互換性確保
- **エラーハンドリング**: 音声許可、API障害、処理タイムアウトの包括的エラー状態

## スコア算出ロジック
```
最終スコア = (声質スコア × 0.2) + (仲良くなりたい度 × 0.4) + (一緒に働きたい度 × 0.4)
```

## 重要な制約事項
- 録音時間: 最大5分
- 音声処理時間: 5分録音に対し30秒以内で分析完了
- 同時利用者数: 50人まで対応
- 音声ファイル自動削除: 評価完了後24時間