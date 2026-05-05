import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: '文字起こしテキストが必要です' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API キーが設定されていません' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `
以下はエンジニアの自己紹介の音声を文字起こししたものです。この内容をもとに、X（Twitter）のプロフィール文を作成してください。

自己紹介文：
"${transcript}"

要件：
- 160文字以内
- エンジニアとしての専門性をアピール
- 親しみやすさも表現
- 技術スキルや興味のある分野を含める
- 絵文字を適度に使用
- X（Twitter）らしい簡潔で魅力的な表現

例：
"フロントエンドエンジニア3年目 ⚛️ React・TypeScript好き | ECサイト開発でパフォーマンス改善に取り組んでます | 読書と映画鑑賞が趣味 📚🎬"

160文字以内のプロフィール文のみを回答してください（説明文は不要）。
`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = (await response.text()).trim()

    // 文字数制限チェック
    const profile = text.length > 160 ? text.substring(0, 157) + '...' : text

    return NextResponse.json({
      profile: profile,
      character_count: profile.length
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'プロフィール生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}