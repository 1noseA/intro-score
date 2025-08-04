'use client'

import { useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'

interface Evaluation {
  scores: {
    friendship_score: number
    work_together_score: number
    total_score: number
  }
  feedback: {
    friendship_reason: string
    work_reason: string
    improvement_suggestions: string[]
  }
}

export default function Home() {
  const [transcript, setTranscript] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [generatedProfile, setGeneratedProfile] = useState('')
  const [showProfileSection, setShowProfileSection] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false)

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript)
    // 評価結果をリセット（新しい文字起こしの場合）
    if (evaluation) {
      setEvaluation(null)
    }
  }

  const handleRecordingStateChange = (recordingState: boolean) => {
    // 録音状態の変更時の処理（必要に応じて実装）
    console.log('Recording state changed:', recordingState)
  }

  const evaluateTranscript = async () => {
    if (!transcript.trim()) return
    
    setIsEvaluating(true)
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI評価に失敗しました')
      }

      const data = await response.json()
      setEvaluation(data)
    } catch (error) {
      console.error('評価エラー:', error)
      alert(error instanceof Error ? error.message : 'AI評価中にエラーが発生しました')
    } finally {
      setIsEvaluating(false)
    }
  }

  const generateProfile = async () => {
    if (!transcript.trim()) return
    
    setIsGeneratingProfile(true)
    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'プロフィール生成に失敗しました')
      }

      const data = await response.json()
      setGeneratedProfile(data.profile)
    } catch (error) {
      console.error('プロフィール生成エラー:', error)
      alert(error instanceof Error ? error.message : 'プロフィール生成中にエラーが発生しました')
    } finally {
      setIsGeneratingProfile(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            intro-score
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI音声分析による自己紹介スキル向上
          </p>
          <p className="text-gray-500 mb-8">
            自己紹介を録音して、AI評価でコミュニケーションスキルを向上させましょう
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mb-8">
            <div className="space-y-6">
              {/* 録音セクション */}
              <div>
                <h3 className="text-lg font-semibold mb-4">1. 自己紹介を録音</h3>
                <VoiceRecorder 
                  onTranscriptChange={handleTranscriptChange}
                  onRecordingStateChange={handleRecordingStateChange}
                />
              </div>

              {/* アクションボタン */}
              {transcript && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">2. 分析・生成</h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={evaluateTranscript}
                      disabled={isEvaluating}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEvaluating ? '🔄 評価中...' : '🤖 AI評価実行'}
                    </button>
                    <button
                      onClick={() => setShowProfileSection(!showProfileSection)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      📱 Xプロフィール生成
                    </button>
                  </div>
                </div>
              )}

              {/* AI評価結果 */}
              {evaluation && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. AI評価結果</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
                    {/* スコア表示 */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{evaluation.scores.friendship_score}</div>
                        <div className="text-sm text-gray-600">仲良くなりたい度</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{evaluation.scores.work_together_score}</div>
                        <div className="text-sm text-gray-600">一緒に働きたい度</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{evaluation.scores.total_score}</div>
                        <div className="text-sm text-gray-600">総合スコア</div>
                      </div>
                    </div>
                    
                    {/* フィードバック */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">👥 親しみやすさについて</h4>
                        <p className="text-sm text-gray-600">{evaluation.feedback.friendship_reason}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">💼 仕事での魅力について</h4>
                        <p className="text-sm text-gray-600">{evaluation.feedback.work_reason}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">💡 改善提案</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {evaluation.feedback.improvement_suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Xプロフィール生成（オプション） */}
              {showProfileSection && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">オプション: Xプロフィール生成</h3>
                  {!generatedProfile ? (
                    <button
                      onClick={generateProfile}
                      disabled={isGeneratingProfile}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingProfile ? '🔄 生成中...' : 'Xプロフィール生成'}
                    </button>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-800 mb-2">{generatedProfile}</p>
                      <p className="text-sm text-gray-500 mb-2">文字数: {generatedProfile.length}/160</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedProfile)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        📋 コピー
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>🎤 音声録音 → 📝 文字起こし → 🤖 AI評価 + 📱 Xプロフィール（オプション）</p>
          </div>
        </div>
      </div>
    </main>
  )
}