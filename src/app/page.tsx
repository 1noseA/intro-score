'use client'

import { useState } from 'react'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [generatedProfile, setGeneratedProfile] = useState('')

  const startRecording = () => {
    setIsRecording(true)
    // TODO: 音声録音機能を実装
  }

  const stopRecording = () => {
    setIsRecording(false)
    // TODO: 文字起こし処理を実装
    setTranscript('サンプル文字起こしテキスト...')
  }

  const generateProfile = async () => {
    // TODO: Xプロフィール生成APIを呼び出し
    setGeneratedProfile('フロントエンドエンジニア3年目 ⚛️ React・TypeScript好き | ECサイト開発でパフォーマンス改善に取り組んでます | 読書と映画鑑賞が趣味 📚🎬')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            intro-score
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            音声からXプロフィールを自動生成
          </p>
          <p className="text-gray-500 mb-8">
            自己紹介を録音して、魅力的なX(Twitter)プロフィールを作成しましょう
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mb-8">
            <div className="space-y-6">
              {/* 録音セクション */}
              <div>
                <h3 className="text-lg font-semibold mb-4">1. 自己紹介を録音</h3>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-8 py-4 rounded-full font-medium transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRecording ? '🔴 録音停止' : '🎤 録音開始'}
                </button>
              </div>

              {/* 文字起こし結果 */}
              {transcript && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">2. 文字起こし結果</h3>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full p-4 border rounded-lg h-32 resize-none"
                    placeholder="文字起こし結果がここに表示されます..."
                  />
                  <button
                    onClick={generateProfile}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Xプロフィール生成
                  </button>
                </div>
              )}

              {/* 生成結果 */}
              {generatedProfile && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. 生成されたXプロフィール</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-800 mb-2">{generatedProfile}</p>
                    <p className="text-sm text-gray-500">文字数: {generatedProfile.length}/160</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedProfile)}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    📋 コピー
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>🎤 音声録音 → 📝 文字起こし → 🤖 AI生成 → 📱 Xプロフィール</p>
          </div>
        </div>
      </div>
    </main>
  )
}