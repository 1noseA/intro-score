import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { voiceAnalysis, transcript } = await request.json()

    if (!voiceAnalysis || !transcript) {
      return NextResponse.json(
        { error: '音声分析データと文字起こしテキストが必要です' },
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
以下の音声分析データと話している内容から、この人の声の特徴を分析してください。

音声分析データ：
- 明瞭度: ${voiceAnalysis.clarity}/10点
- 音量: ${voiceAnalysis.volume}/5点 (1:小さすぎ, 3:適切, 5:大きすぎ)
- 話速: ${voiceAnalysis.speechRate}文字/分
- 声の安定性: ${voiceAnalysis.stability}/10点

話している内容：
"${transcript}"

以下のJSON形式で声の特徴を分析してください：

{
  "pitch": "高め" | "普通" | "低め",
  "impression": "親しみやすい" | "落ち着いている" | "元気な" | "プロフェッショナル" | "温かい" | "力強い" | "優しい" | "知的な",
  "characterDescription": "声の特徴的な表現（例：包容力のある声、テレビアナウンサーのような）",
  "similarCelebrity": "著名人やキャラクター名（optional、類似性がある場合のみ）",
  "overallComment": "総合的な声の印象コメント（50-100文字）"
}

分析の基準：
- 話速が早い(400文字/分以上)→元気な印象
- 話速が遅い(250文字/分以下)→落ち着いている印象  
- 明瞭度が高い(8点以上)→プロフェッショナル
- 安定性が高い(8点以上)→落ち着いている、信頼感
- 音量が適切で安定→親しみやすい

著名人との類似性は控えめに、明確な特徴がある場合のみ言及してください。
`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = await response.text()

    // JSONを抽出
    let jsonText = text
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    try {
      const voiceCharacteristics = JSON.parse(jsonText)
      
      return NextResponse.json(voiceCharacteristics)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', text)
      
      return NextResponse.json(
        { error: '声質分析の解析に失敗しました' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Voice characteristics analysis error:', error)
    return NextResponse.json(
      { error: '声質分析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}