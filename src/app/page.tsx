'use client'

import { useState } from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'
import AIPersonaSelector, { AIPersona } from '@/components/AIPersonaSelector'

interface VoiceAnalysis {
  clarity: number // 1-10点
  volume: number // 1-5点
  speechRate: number // 文字/分
  stability: number // 1-10点
}

interface VoiceCharacteristics {
  pitch: string // 高め/普通/低め
  impression: string // 親しみやすい/落ち着いている等
  characterDescription: string // 声の特徴的な表現
  similarCelebrity?: string // 著名人・キャラクター類似性
  overallComment: string // 総合的な声の印象コメント
}

interface Evaluation {
  scores: {
    friendship_score: number
    work_together_score: number
    total_score: number
    voice_score?: number // 音声スコアを追加
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
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null)
  const [voiceCharacteristics, setVoiceCharacteristics] = useState<VoiceCharacteristics | null>(null)
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null)

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

  const handleVoiceAnalysis = (analysis: VoiceAnalysis) => {
    setVoiceAnalysis(analysis)
    console.log('Voice analysis:', analysis)
  }

  const handleClear = () => {
    // すべての分析・評価結果をリセット
    setEvaluation(null)
    setVoiceAnalysis(null)
    setVoiceCharacteristics(null)
    setGeneratedProfile('')
    setShowProfileSection(false)
  }

  const analyzeVoiceCharacteristics = async () => {
    if (!voiceAnalysis || !transcript.trim()) return
    
    setIsAnalyzingVoice(true)
    try {
      const response = await fetch('/api/analyze-voice-characteristics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          voiceAnalysis,
          transcript 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '声質分析に失敗しました')
      }

      const data = await response.json()
      setVoiceCharacteristics(data)
    } catch (error) {
      console.error('声質分析エラー:', error)
      alert(error instanceof Error ? error.message : '声質分析中にエラーが発生しました')
    } finally {
      setIsAnalyzingVoice(false)
    }
  }

  const evaluateTranscript = async () => {
    if (!transcript.trim()) return
    
    if (!selectedPersona) {
      alert('評価者を選択してください')
      return
    }
    
    setIsEvaluating(true)
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcript,
          voiceAnalysis,
          aiPersona: selectedPersona
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI評価に失敗しました')
      }

      const data = await response.json()
      
      // 音声スコアを計算して追加
      if (voiceAnalysis) {
        const voiceScore = Math.round(
          (voiceAnalysis.clarity * 0.3) + 
          ((6 - Math.abs(voiceAnalysis.volume - 3)) * 2 * 0.2) + 
          (voiceAnalysis.stability * 0.3) + 
          (Math.min(10, Math.max(1, 10 - Math.abs(voiceAnalysis.speechRate - 350) / 50)) * 0.2)
        )
        data.scores.voice_score = voiceScore
        
        // 総合スコアを再計算（音声スコアを含む）
        data.scores.total_score = Math.round(
          (data.scores.friendship_score * 0.3) + 
          (data.scores.work_together_score * 0.4) + 
          (voiceScore * 0.3)
        )
      }
      
      setEvaluation(data)
    } catch (error) {
      console.error('評価エラー:', error)
      console.error('Full error details:', error)
      
      // ネットワークエラーの場合
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('ネットワークエラーが発生しました。接続を確認してください。')
      } else {
        alert(error instanceof Error ? error.message : 'AI評価中にエラーが発生しました。しばらく待ってから再度お試しください。')
      }
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
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto mb-8">
            <div className="space-y-8">
              {/* AI人格選択セクション */}
              <div>
                <h3 className="text-lg font-semibold mb-4">1. 評価者を選択</h3>
                <AIPersonaSelector 
                  selectedPersona={selectedPersona}
                  onPersonaChange={setSelectedPersona}
                />
              </div>

              {/* 録音セクション */}
              <div>
                <h3 className="text-lg font-semibold mb-4">2. 自己紹介を録音</h3>
                <VoiceRecorder 
                  onTranscriptChange={handleTranscriptChange}
                  onRecordingStateChange={handleRecordingStateChange}
                  onVoiceAnalysis={handleVoiceAnalysis}
                  onClear={handleClear}
                />
              </div>

              {/* AI評価ボタン */}
              {transcript && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. 分析・評価</h3>
                  <div className="flex justify-center">
                    <button
                      onClick={evaluateTranscript}
                      disabled={isEvaluating}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEvaluating ? '🔄 評価中...' : '🤖 AI評価実行'}
                    </button>
                  </div>
                </div>
              )}

              {/* 音声分析結果 */}
              {voiceAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">📊 音声分析結果</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{voiceAnalysis.clarity}/10</div>
                        <div className="text-sm text-gray-600">聞き取りやすさ</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {voiceAnalysis.volume === 1 && '小さすぎ'}
                          {voiceAnalysis.volume === 2 && 'やや小さ'}
                          {voiceAnalysis.volume === 3 && '適切'}
                          {voiceAnalysis.volume === 4 && 'やや大き'}
                          {voiceAnalysis.volume === 5 && '大きすぎ'}
                        </div>
                        <div className="text-sm text-gray-600">音量適切性</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{voiceAnalysis.speechRate}</div>
                        <div className="text-sm text-gray-600">話速 (文字/分)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{voiceAnalysis.stability}/10</div>
                        <div className="text-sm text-gray-600">声の安定性</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">推奨話速: 300-400文字/分</div>
                      <div className="text-xs text-gray-500 mb-3">
                        {voiceAnalysis.speechRate < 250 && '⚠️ 少しゆっくりすぎるかもしれません'}
                        {voiceAnalysis.speechRate >= 250 && voiceAnalysis.speechRate <= 450 && '✅ 適切な話速です'}
                        {voiceAnalysis.speechRate > 450 && '⚠️ 少し早すぎるかもしれません'}
                      </div>
                      {!voiceCharacteristics ? (
                        <button
                          onClick={analyzeVoiceCharacteristics}
                          disabled={isAnalyzingVoice}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isAnalyzingVoice ? '🔄 声質分析中...' : '🎭 声質・印象分析'}
                        </button>
                      ) : (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-200">
                          <h4 className="font-medium text-gray-800 mb-3">🎭 声質・印象分析結果</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">声の高低:</span>
                              <span className="font-medium">{voiceCharacteristics.pitch}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">全体印象:</span>
                              <span className="font-medium">{voiceCharacteristics.impression}</span>
                            </div>
                            <div className="mt-3">
                              <div className="text-gray-600 mb-1">特徴:</div>
                              <div className="text-gray-800 italic">"{voiceCharacteristics.characterDescription}"</div>
                            </div>
                            {voiceCharacteristics.similarCelebrity && (
                              <div className="mt-2">
                                <div className="text-gray-600 mb-1">類似性:</div>
                                <div className="text-gray-800">{voiceCharacteristics.similarCelebrity}のような</div>
                              </div>
                            )}
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <div className="text-gray-700">{voiceCharacteristics.overallComment}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AI評価結果 */}
              {evaluation && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI評価結果</h3>
                  {selectedPersona && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-700">
                        評価者: <span className="font-medium">{selectedPersona.name}</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">{selectedPersona.description}</div>
                    </div>
                  )}
                  <div className="bg-gray-50 p-6 rounded-lg border space-y-4">
                    {/* スコア表示 */}
                    <div className={`grid ${evaluation.scores.voice_score ? 'grid-cols-4' : 'grid-cols-3'} gap-4 text-center`}>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{evaluation.scores.friendship_score}</div>
                        <div className="text-sm text-gray-600">仲良くなりたい度</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{evaluation.scores.work_together_score}</div>
                        <div className="text-sm text-gray-600">一緒に働きたい度</div>
                      </div>
                      {evaluation.scores.voice_score && (
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{evaluation.scores.voice_score}</div>
                          <div className="text-sm text-gray-600">音声スコア</div>
                        </div>
                      )}
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

            </div>
          </div>

          {/* Xプロフィール生成ボタン */}
          {transcript && !showProfileSection && (
            <div className="text-center mb-8">
              <button
                onClick={() => setShowProfileSection(true)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                📱 Xプロフィール生成
              </button>
              <p className="text-xs text-gray-400 mt-1">オプション：自己紹介からXのプロフィール文を生成</p>
            </div>
          )}

          {/* Xプロフィール生成結果 */}
          {showProfileSection && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">📱 Xプロフィール生成</h3>
              {!generatedProfile ? (
                <div className="text-center">
                  <button
                    onClick={generateProfile}
                    disabled={isGeneratingProfile}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingProfile ? '🔄 生成中...' : '生成実行'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">160文字以内のXプロフィール文を生成します</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-800 mb-2">{generatedProfile}</p>
                    <p className="text-sm text-gray-500 mb-3">文字数: {generatedProfile.length}/160</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedProfile)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        📋 コピー
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedProfile('')
                          setShowProfileSection(false)
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                      >
                        閉じる
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>🎤 音声録音 → 📝 文字起こし → 🤖 AI評価 + 📱 Xプロフィール（オプション）</p>
          </div>
        </div>
      </div>
    </main>
  )
}