# intro-score API仕様書

## 1. API概要

### 1.1 ベース情報
- **ベースURL**: `https://your-app.vercel.app/api`
- **プロトコル**: HTTPS
- **認証方式**: なし（ローカル処理）
- **レスポンス形式**: JSON
- **文字エンコーディング**: UTF-8

### 1.2 共通仕様

#### 共通レスポンス形式
```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string,
    "details": object
  } | null,
  "metadata": {
    "timestamp": string,
    "request_id": string,
    "processing_time_ms": number
  }
}
```

#### HTTPステータスコード
- `200`: 成功
- `201`: 作成成功
- `400`: リクエストエラー
- `404`: リソース未発見
- `429`: レート制限
- `500`: サーバーエラー

## 2. 録音・音声処理API

### 2.1 文字起こし実行

#### エンドポイント
```http
POST /api/transcribe
```

#### リクエストボディ（multipart/form-data）
```
audio: (音声ファイル - WebM形式)
language: ja-JP
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "transcript": "はじめまして、田中太郎と申します。フロントエンドエンジニアとして3年間働いており、ReactとTypeScriptを主に使用しています...",
    "confidence": 0.92,
    "processing_time_ms": 5000,
    "duration": 120
  },
  "error": null
}
```

### 2.2 音響分析実行

#### エンドポイント
```http
POST /api/analyze-voice
```

#### リクエストボディ（multipart/form-data）
```
audio: (音声ファイル - WebM形式)
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "clarity_score": 8.5,
    "volume_level": "適切",
    "speech_rate": 350.5,
    "speech_rate_evaluation": "適切",
    "stability_score": 7.2,
    "total_voice_score": 81.5,
    "raw_analysis_data": {
      "amplitude_variance": 0.15,
      "frequency_analysis": {...},
      "silence_detection": {...}
    }
  },
  "error": null
}
```

## 3. プロフィール管理API

### 3.1 エンジニアプロフィール抽出

#### エンドポイント
```http
POST /api/extract-profile
```

#### リクエストボディ
```json
{
  "transcript": "文字起こしテキスト"
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "basic_info": {
      "name": "田中太郎",
      "experience_years": 3,
      "position": "フロントエンドエンジニア",
      "team": "プロダクト開発チーム"
    },
    "technical_skills": {
      "programming_languages": [
        {"name": "JavaScript", "confidence": 0.95},
        {"name": "TypeScript", "confidence": 0.92},
        {"name": "Python", "confidence": 0.75}
      ],
      "frameworks_libraries": [
        {"name": "React", "confidence": 0.98},
        {"name": "Next.js", "confidence": 0.85},
        {"name": "TailwindCSS", "confidence": 0.80}
      ],
      "tools_infrastructure": [
        {"name": "Git", "confidence": 0.90},
        {"name": "Docker", "confidence": 0.70},
        {"name": "AWS", "confidence": 0.60}
      ]
    },
    "specializations": ["Frontend", "UI/UX"],
    "projects_achievements": "ECサイトのフロントエンド開発でパフォーマンスを30%改善しました。",
    "personal_interests": {
      "hobbies": ["読書", "映画鑑賞"],
      "other_skills": ["デザイン", "写真撮影"]
    },
    "extracted_keywords": ["React", "フロントエンド", "UI", "パフォーマンス"]
  },
  "error": null
}
```

## 4. X自己紹介生成API

### 4.1 Xプロフィール生成

#### エンドポイント
```http
POST /api/generate-x-profile
```

#### リクエストボディ
```json
{
  "transcript": "はじめまして、田中太郎と申します。フロントエンドエンジニアとして3年間働いており..."
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "generated_text": "フロントエンドエンジニア3年目 ⚛️ React・TypeScript好き | ECサイト開発でパフォーマンス改善に取り組んでます | 読書と映画鑑賞が趣味 📚🎬",
    "character_count": 89,
    "processing_time_ms": 1200
  },
  "error": null
}
```

## 5. エラーハンドリング

### 5.1 エラーレスポンス形式

#### バリデーションエラー (400)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力データが正しくありません",
    "details": {
      "field_errors": {
        "name": ["名前は必須です"],
        "description": ["説明は500文字以内で入力してください"]
      }
    }
  }
}
```

#### レート制限エラー (429)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API呼び出し制限を超えました",
    "details": {
      "retry_after": 60,
      "limit": "15 requests per minute"
    }
  }
}
```

#### サーバーエラー (500)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "サーバー内部エラーが発生しました",
    "details": {
      "request_id": "req_123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### 5.2 エラーコード一覧

| エラーコード | HTTPステータス | 説明 |
|-------------|---------------|------|
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | 入力データエラー |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| FILE_TOO_LARGE | 400 | ファイルサイズ超過 |
| UNSUPPORTED_FILE_TYPE | 400 | サポートされていないファイル形式 |
| GEMINI_API_ERROR | 500 | Gemini API呼び出しエラー |
| TRANSCRIPTION_FAILED | 500 | 文字起こし処理失敗 |
| AUDIO_ANALYSIS_FAILED | 500 | 音響分析処理失敗 |
| INTERNAL_SERVER_ERROR | 500 | サーバー内部エラー |

## 6. レート制限

### 6.1 制限値
- **一般API**: 100 requests/minute
- **ファイルアップロード**: 10 requests/minute
- **自己紹介生成**: 3 requests/minute

---

**更新履歴**
- v1.0.0: 初版作成（2025-07-21）