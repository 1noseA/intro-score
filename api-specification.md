# intro-score API仕様書

## 1. API概要

### 1.1 ベース情報
- **ベースURL**: `https://your-app.vercel.app/api`
- **プロトコル**: HTTPS
- **認証方式**: Supabase JWT Token
- **レスポンス形式**: JSON
- **文字エンコーディング**: UTF-8

### 1.2 共通仕様

#### 認証ヘッダー
```http
Authorization: Bearer {supabase_jwt_token}
```

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
- `401`: 認証エラー
- `403`: 認可エラー
- `404`: リソース未発見
- `429`: レート制限
- `500`: サーバーエラー

## 2. 認証API

### 2.1 ユーザー情報取得

#### エンドポイント
```http
GET /api/auth/user
```

#### リクエスト
認証ヘッダー必須

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "display_name": "田中太郎",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-07-21T10:00:00Z",
    "updated_at": "2025-07-21T10:00:00Z"
  },
  "error": null
}
```

### 2.2 ユーザー情報更新

#### エンドポイント
```http
PATCH /api/auth/user
```

#### リクエストボディ
```json
{
  "display_name": "新しい名前",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "display_name": "新しい名前",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "updated_at": "2025-07-21T11:00:00Z"
  },
  "error": null
}
```

## 3. 録音・音声処理API

### 3.1 録音セッション開始

#### エンドポイント
```http
POST /api/recordings
```

#### リクエストボディ
```json
{
  "title": "自己紹介練習 #1"
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "id": "rec_123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "自己紹介練習 #1",
    "status": "recording",
    "created_at": "2025-07-21T10:00:00Z",
    "upload_url": "https://supabase-storage-url/upload-endpoint"
  },
  "error": null
}
```

### 3.2 音声ファイルアップロード

#### エンドポイント
```http
POST /api/recordings/{recording_id}/upload
```

#### リクエスト（multipart/form-data）
```
audio: (音声ファイル - WebM形式)
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "recording_id": "rec_123e4567-e89b-12d3-a456-426614174000",
    "audio_url": "https://storage.supabase.co/path/to/audio.webm",
    "duration": 120,
    "file_size": 2048000,
    "status": "uploaded"
  },
  "error": null
}
```

### 3.3 文字起こし実行

#### エンドポイント
```http
POST /api/recordings/{recording_id}/transcribe
```

#### リクエストボディ
```json
{
  "language": "ja-JP",
  "options": {
    "auto_punctuation": true,
    "speaker_detection": false
  }
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "recording_id": "rec_123e4567-e89b-12d3-a456-426614174000",
    "transcript": "はじめまして、田中太郎と申します。フロントエンドエンジニアとして3年間働いており、ReactとTypeScriptを主に使用しています...",
    "confidence": 0.92,
    "processing_time_ms": 5000,
    "status": "transcribed"
  },
  "error": null
}
```

### 3.4 音響分析実行

#### エンドポイント
```http
POST /api/recordings/{recording_id}/analyze-voice
```

#### リクエスト
認証ヘッダー必須（ボディなし）

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "recording_id": "rec_123e4567-e89b-12d3-a456-426614174000",
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

### 3.5 録音データ一覧取得

#### エンドポイント
```http
GET /api/recordings
```

#### クエリパラメータ
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 20、最大: 100）
- `status`: 状態フィルター（recording, processing, completed, error）
- `sort`: ソート順（created_at_desc, created_at_asc, title_asc）

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "recordings": [
      {
        "id": "rec_123e4567-e89b-12d3-a456-426614174000",
        "title": "自己紹介練習 #1",
        "duration": 120,
        "status": "completed",
        "created_at": "2025-07-21T10:00:00Z",
        "has_evaluation": true,
        "evaluation_count": 2
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_count": 45,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  },
  "error": null
}
```

### 3.6 録音データ詳細取得

#### エンドポイント
```http
GET /api/recordings/{recording_id}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "id": "rec_123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "自己紹介練習 #1",
    "audio_url": "https://storage.supabase.co/path/to/audio.webm",
    "transcript": "はじめまして、田中太郎と申します...",
    "duration": 120,
    "file_size": 2048000,
    "status": "completed",
    "created_at": "2025-07-21T10:00:00Z",
    "updated_at": "2025-07-21T10:05:00Z"
  },
  "error": null
}
```

## 4. AI人格管理API

### 4.1 AI人格一覧取得

#### エンドポイント
```http
GET /api/ai-personas
```

#### クエリパラメータ
- `include_presets`: プリセット人格を含めるか（true/false、デフォルト: true）
- `active_only`: アクティブな人格のみ（true/false、デフォルト: true）

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "id": "preset_technical_mentor",
        "name": "技術メンター",
        "description": "技術スキルを重視して評価する経験豊富なエンジニア",
        "is_preset": true,
        "usage_count": 150
      }
    ],
    "custom": [
      {
        "id": "custom_123e4567-e89b-12d3-a456-426614174000",
        "name": "厳しい先輩",
        "description": "厳しいけど的確なアドバイスをくれる10年目のシニアエンジニア...",
        "is_preset": false,
        "usage_count": 5,
        "created_at": "2025-07-21T09:00:00Z"
      }
    ]
  },
  "error": null
}
```

### 4.2 カスタムAI人格作成

#### エンドポイント
```http
POST /api/ai-personas
```

#### リクエストボディ
```json
{
  "name": "優しいメンター",
  "description": "温かく見守ってくれる優しいメンター。初心者にも分かりやすくアドバイスをしてくれて、技術的な成長を応援してくれる先輩エンジニアのような人格です。批判的ではなく建設的なフィードバックを心がけています。"
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "id": "custom_123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "優しいメンター",
    "description": "温かく見守ってくれる優しいメンター...",
    "is_preset": false,
    "is_active": true,
    "usage_count": 0,
    "created_at": "2025-07-21T12:00:00Z"
  },
  "error": null
}
```

### 4.3 AI人格更新

#### エンドポイント
```http
PATCH /api/ai-personas/{persona_id}
```

#### リクエストボディ
```json
{
  "name": "更新された名前",
  "description": "更新された説明文",
  "is_active": false
}
```

### 4.4 AI人格削除

#### エンドポイント
```http
DELETE /api/ai-personas/{persona_id}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "deleted_id": "custom_123e4567-e89b-12d3-a456-426614174000",
    "message": "AI人格が正常に削除されました"
  },
  "error": null
}
```

## 5. 評価API

### 5.1 AI評価実行

#### エンドポイント
```http
POST /api/recordings/{recording_id}/evaluate
```

#### リクエストボディ
```json
{
  "ai_persona_id": "custom_123e4567-e89b-12d3-a456-426614174000"
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval_123e4567-e89b-12d3-a456-426614174000",
    "recording_id": "rec_123e4567-e89b-12d3-a456-426614174000",
    "ai_persona": {
      "id": "custom_123e4567-e89b-12d3-a456-426614174000",
      "name": "優しいメンター"
    },
    "scores": {
      "friendship_score": 85,
      "work_together_score": 78,
      "total_score": 82.6
    },
    "feedback": {
      "friendship_reason": "とても親しみやすい話し方で、自然な笑顔が伝わってきます。技術的な話も分かりやすく説明されており、一緒に過ごしたいと感じさせる魅力があります。",
      "work_reason": "技術スキルがしっかりしており、チームワークを大切にする姿勢が伝わります。ただし、もう少し具体的なプロジェクト経験を話すとより説得力が増すでしょう。",
      "improvement_suggestions": [
        "具体的なプロジェクト事例を1-2個追加すると良いでしょう",
        "技術選択の理由を簡潔に説明できると印象が向上します",
        "チームでの役割や貢献をもう少し具体的に表現してみてください"
      ]
    },
    "processing_time_ms": 3500,
    "created_at": "2025-07-21T12:30:00Z"
  },
  "error": null
}
```

### 5.2 評価結果一覧取得

#### エンドポイント
```http
GET /api/recordings/{recording_id}/evaluations
```

#### レスポンス例
```json
{
  "success": true,
  "data": [
    {
      "id": "eval_123e4567-e89b-12d3-a456-426614174000",
      "ai_persona": {
        "id": "custom_123e4567-e89b-12d3-a456-426614174000",
        "name": "優しいメンター",
        "is_preset": false
      },
      "scores": {
        "friendship_score": 85,
        "work_together_score": 78,
        "total_score": 82.6
      },
      "created_at": "2025-07-21T12:30:00Z"
    }
  ],
  "error": null
}
```

### 5.3 評価結果詳細取得

#### エンドポイント
```http
GET /api/evaluations/{evaluation_id}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "id": "eval_123e4567-e89b-12d3-a456-426614174000",
    "recording": {
      "id": "rec_123e4567-e89b-12d3-a456-426614174000",
      "title": "自己紹介練習 #1",
      "duration": 120
    },
    "ai_persona": {
      "id": "custom_123e4567-e89b-12d3-a456-426614174000",
      "name": "優しいメンター",
      "description": "温かく見守ってくれる..."
    },
    "voice_analysis": {
      "clarity_score": 8.5,
      "volume_level": "適切",
      "speech_rate_evaluation": "適切",
      "stability_score": 7.2,
      "total_voice_score": 81.5
    },
    "scores": {
      "friendship_score": 85,
      "work_together_score": 78,
      "total_score": 82.6
    },
    "feedback": {
      "friendship_reason": "...",
      "work_reason": "...",
      "improvement_suggestions": ["...", "...", "..."],
      "evaluation_summary": "全体的に良い印象の自己紹介です..."
    },
    "metadata": {
      "processing_time_ms": 3500,
      "created_at": "2025-07-21T12:30:00Z"
    }
  },
  "error": null
}
```

## 6. プロフィール管理API

### 6.1 エンジニアプロフィール取得

#### エンドポイント
```http
GET /api/recordings/{recording_id}/profile
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "recording_id": "rec_123e4567-e89b-12d3-a456-426614174000",
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
    "skill_levels": {
      "JavaScript": "advanced",
      "React": "advanced",
      "TypeScript": "intermediate",
      "Python": "beginner"
    },
    "projects_achievements": "ECサイトのフロントエンド開発でパフォーマンスを30%改善しました。",
    "personal_interests": {
      "hobbies": ["読書", "映画鑑賞"],
      "other_skills": ["デザイン", "写真撮影"]
    },
    "extracted_keywords": ["React", "フロントエンド", "UI", "パフォーマンス"],
    "created_at": "2025-07-21T12:35:00Z"
  },
  "error": null
}
```

### 6.2 プロフィール更新

#### エンドポイント
```http
PATCH /api/recordings/{recording_id}/profile
```

#### リクエストボディ
```json
{
  "basic_info": {
    "name": "田中太郎",
    "experience_years": 4,
    "position": "シニアフロントエンドエンジニア"
  },
  "programming_languages": [
    {"name": "JavaScript", "confidence": 0.98},
    {"name": "TypeScript", "confidence": 0.95}
  ]
}
```

## 7. 自己紹介生成API

### 7.1 自己紹介文生成

#### エンドポイント
```http
POST /api/recordings/{recording_id}/generate-introductions
```

#### リクエストボディ
```json
{
  "platforms": ["twitter", "instagram", "note", "tech_blog"],
  "options": {
    "tone": "casual", // casual, professional, friendly
    "include_technical_details": true,
    "max_length": {
      "twitter": 160,
      "instagram": 150,
      "note": 500,
      "tech_blog": 400
    }
  }
}
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "generations": [
      {
        "platform_type": "twitter",
        "generated_text": "フロントエンドエンジニア3年目 ⚛️ React・TypeScript好き | ECサイト開発でパフォーマンス改善に取り組んでます | 読書と映画鑑賞が趣味 📚🎬",
        "character_count": 89,
        "generation_time_ms": 1200
      },
      {
        "platform_type": "tech_blog",
        "generated_text": "フロントエンドエンジニアとして3年間、React・TypeScriptを中心とした開発に携わっています。ECサイト開発ではパフォーマンス改善により読み込み速度を30%向上させました。技術の学習と実践を通じて、より良いユーザー体験の提供を目指しています。このブログでは開発で得た知見や挑戦を共有していきます。",
        "character_count": 178,
        "generation_time_ms": 1500
      }
    ],
    "total_processing_time_ms": 2700
  },
  "error": null
}
```

### 7.2 生成済み自己紹介一覧取得

#### エンドポイント
```http
GET /api/recordings/{recording_id}/introductions
```

#### レスポンス例
```json
{
  "success": true,
  "data": [
    {
      "id": "intro_123e4567-e89b-12d3-a456-426614174000",
      "platform_type": "twitter",
      "generated_text": "フロントエンドエンジニア3年目 ⚛️ React・TypeScript好き | ECサイト開発でパフォーマンス改善に取り組んでます...",
      "character_count": 98,
      "user_edited": false,
      "created_at": "2025-07-21T13:00:00Z"
    }
  ],
  "error": null
}
```

### 7.3 自己紹介文更新

#### エンドポイント
```http
PATCH /api/introductions/{introduction_id}
```

#### リクエストボディ
```json
{
  "user_edited_text": "編集されたテキスト内容"
}
```

## 8. 統計・分析API

### 8.1 ユーザー統計取得

#### エンドポイント
```http
GET /api/user/stats
```

#### レスポンス例
```json
{
  "success": true,
  "data": {
    "recordings": {
      "total_count": 15,
      "completed_count": 12,
      "total_duration_minutes": 45
    },
    "evaluations": {
      "total_count": 28,
      "average_scores": {
        "friendship_score": 78.5,
        "work_together_score": 82.1,
        "total_score": 80.8
      },
      "score_trend": [
        {"date": "2025-07-15", "score": 75.2},
        {"date": "2025-07-18", "score": 78.1},
        {"date": "2025-07-21", "score": 82.6}
      ]
    },
    "ai_personas": {
      "total_custom_personas": 5,
      "most_used_persona": {
        "name": "優しいメンター",
        "usage_count": 8
      }
    }
  },
  "error": null
}
```

## 9. エラーハンドリング

### 9.1 エラーレスポンス形式

#### 認証エラー (401)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です",
    "details": {
      "reason": "missing_token"
    }
  }
}
```

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

### 9.2 エラーコード一覧

| エラーコード | HTTPステータス | 説明 |
|-------------|---------------|------|
| UNAUTHORIZED | 401 | 認証が必要 |
| FORBIDDEN | 403 | アクセス権限なし |
| NOT_FOUND | 404 | リソースが見つからない |
| VALIDATION_ERROR | 400 | 入力データエラー |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |
| FILE_TOO_LARGE | 400 | ファイルサイズ超過 |
| UNSUPPORTED_FILE_TYPE | 400 | サポートされていないファイル形式 |
| GEMINI_API_ERROR | 500 | Gemini API呼び出しエラー |
| TRANSCRIPTION_FAILED | 500 | 文字起こし処理失敗 |
| AUDIO_ANALYSIS_FAILED | 500 | 音響分析処理失敗 |
| INTERNAL_SERVER_ERROR | 500 | サーバー内部エラー |

## 10. レート制限

### 10.1 制限値
- **一般API**: 100 requests/minute/user
- **AI評価API**: 5 requests/minute/user
- **ファイルアップロード**: 10 requests/minute/user
- **自己紹介生成**: 3 requests/minute/user

### 10.2 制限ヘッダー
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642780800
```

## 11. Webhook（将来実装予定）

### 11.1 評価完了通知
```json
{
  "event": "evaluation.completed",
  "data": {
    "evaluation_id": "eval_123e4567-e89b-12d3-a456-426614174000",
    "recording_id": "rec_123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "scores": {
      "total_score": 82.6
    }
  },
  "timestamp": "2025-07-21T12:30:00Z"
}
```

---

**更新履歴**
- v1.0.0: 初版作成（2025-07-21）