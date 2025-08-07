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
  "impression": "声の第一印象や感想（例：優しい感じがする、芸能人だと○○さんみたい、○○な雰囲気がする）",
  "characterDescription": "声の特徴的な表現（例：包容力のある声、テレビアナウンサーのような）",
  "similarCelebrity": "著名人やキャラクター名（optional、類似性がある場合のみ）",
  "overallComment": "音声分析結果を踏まえた客観的な評価とアドバイス（50-100文字）"
}

重要な役割分担：

【impression】（声の印象）
- 主観的な感想や第一印象
- 「〜な感じがする」「〜な雰囲気がある」「〜みたいな印象」といった表現
- 職業や役柄のイメージで表現（例：「先生みたいな」「アナウンサーっぽい」「営業の人みたい」）
- 抽象的な表現を中心に（例：「優しそうな感じ」「頼りになりそうな雰囲気」）

【overallComment】（総合コメント）
- 分析データに基づく客観的な評価
- コミュニケーションにおける声の効果や改善点
- ビジネスや人間関係での実用的な印象
- 例：「明瞭度が高く聞き取りやすいため、プレゼンテーションに向いています」

分析の基準：
- 話速が早い→元気で活発な印象
- 話速が遅い→落ち着いた、慎重な印象
- 明瞭度が高い→プロフェッショナル、信頼できる印象
- 安定性が高い→安心感、頼りがいがある印象

注意事項：
- 具体的な著名人名は使用しないでください
- 「○○さんのような」という表現は避けてください
- 職業や役柄のイメージ（「先生みたい」「アナウンサーっぽい」）は使用可能です
- similarCelebrityフィールドは、文字起こし内容から音声の特徴だけでは判断できないため、基本的に空にしてください
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