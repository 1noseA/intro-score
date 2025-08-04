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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
以下はエンジニアの自己紹介の音声を文字起こししたものです。この自己紹介を評価してください。

自己紹介文：
"${transcript}"

以下の2つの観点でそれぞれ0-100点で評価し、JSON形式で回答してください：

1. 仲良くなりたい度：親しみやすさ、人柄の良さ、コミュニケーション能力
2. 一緒に働きたい度：技術力、信頼性、チームワーク、プロフェッショナル性

また、それぞれのスコアの理由と具体的な改善提案を3つずつ提供してください。

回答形式（必ずこの形式で回答してください）：
{
  "scores": {
    "friendship_score": 数値,
    "work_together_score": 数値,
    "total_score": 数値
  },
  "feedback": {
    "friendship_reason": "親しみやすさのスコア理由",
    "work_reason": "仕事での魅力のスコア理由",
    "improvement_suggestions": [
      "改善提案1",
      "改善提案2", 
      "改善提案3"
    ]
  }
}

総合スコアは以下の計算式で算出してください：
総合スコア = (仲良くなりたい度 × 0.4) + (一緒に働きたい度 × 0.6)
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // JSONを抽出（```json```で囲まれている場合があるため）
    let jsonText = text
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    try {
      const evaluation = JSON.parse(jsonText)
      
      // スコアの妥当性チェック
      if (!evaluation.scores || 
          typeof evaluation.scores.friendship_score !== 'number' ||
          typeof evaluation.scores.work_together_score !== 'number') {
        throw new Error('Invalid score format')
      }

      // 総合スコアを計算
      evaluation.scores.total_score = Math.round(
        (evaluation.scores.friendship_score * 0.4) + 
        (evaluation.scores.work_together_score * 0.6)
      )

      return NextResponse.json(evaluation)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', text)
      
      return NextResponse.json(
        { error: 'AI評価の解析に失敗しました' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'AI評価中にエラーが発生しました' },
      { status: 500 }
    )
  }
}