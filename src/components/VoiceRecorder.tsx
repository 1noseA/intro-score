'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceAnalysis {
  clarity: number // 1-10点
  volume: number // 1-5点 (1:小さい, 2:やや小さい, 3:適切, 4:やや大きい, 5:大きい)
  speechRate: number // 文字/分
  stability: number // 1-10点 (声の安定性)
  pitch: number // 1-5点 (1:低い, 2:やや低い, 3:普通, 4:やや高い, 5:高い)
}

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
  onVoiceAnalysis?: (analysis: VoiceAnalysis) => void
  onClear?: () => void
}

export default function VoiceRecorder({ onTranscriptChange, onRecordingStateChange, onVoiceAnalysis, onClear }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>(new Array(50).fill(0))
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [pendingAnalysis, setPendingAnalysis] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const transcriptRef = useRef('')
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const startTimeRef = useRef<number>(0)
  const volumeHistoryRef = useRef<number[]>([])
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pendingAnalysisRef = useRef<boolean>(false)

  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return null
    
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return null
    
    const recognition = new SpeechRecognitionClass()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'ja-JP'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultTranscript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += resultTranscript
        } else {
          interimTranscript += resultTranscript
        }
      }

      // 確定済みテキスト + 暫定テキストを表示
      const currentFullTranscript = transcriptRef.current + interimTranscript
      
      // 常に現在の完全なテキストを表示（沈黙時でも確定済み部分は残る）
      setTranscript(currentFullTranscript)
      onTranscriptChange(currentFullTranscript)

      // 確定されたテキストがある場合のみrefを更新
      if (finalTranscript) {
        transcriptRef.current += finalTranscript
        
        // 更新後、確定済みテキストのみでも再表示（暫定テキストがクリアされた場合の保険）
        setTranscript(transcriptRef.current)
        onTranscriptChange(transcriptRef.current)
        
        // 録音停止後で音声分析待ちの場合、音声分析を実行
        if (pendingAnalysisRef.current) {
          pendingAnalysisRef.current = false
          setPendingAnalysis(false)
          
          // 少し遅延させて音声分析を実行
          setTimeout(() => {
            const voiceAnalysis = calculateVoiceAnalysis()
            if (onVoiceAnalysis) {
              onVoiceAnalysis(voiceAnalysis)
            }
          }, 100)
        }
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setError(`音声認識エラー: ${event.error}`)
    }

    recognition.onend = () => {
      // 録音中の場合は自動的に音声認識を再開
      // ただし、状態をリセットしない
      if (isRecording) {
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              // 音声認識の再開に失敗した場合はエラーを設定
              setError('音声認識の再開に失敗しました')
            }
          }
        }, 100)
      }
    }

    return recognition
  }

  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    
    // 音量計算
    let sum = 0
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i]
    }
    const averageVolume = sum / dataArrayRef.current.length
    volumeHistoryRef.current.push(averageVolume)
    
    // 履歴を最大500個に制限
    if (volumeHistoryRef.current.length > 500) {
      volumeHistoryRef.current.shift()
    }
  }

  const updateWaveform = () => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    
    // 波形データを更新（50個のバーで表示）
    const newWaveformData = []
    const barCount = 50
    const dataPerBar = Math.floor(dataArrayRef.current.length / barCount)
    
    for (let i = 0; i < barCount; i++) {
      let sum = 0
      for (let j = 0; j < dataPerBar; j++) {
        sum += dataArrayRef.current[i * dataPerBar + j]
      }
      newWaveformData.push(sum / dataPerBar / 255) // 0-1の範囲に正規化
    }
    
    setWaveformData(newWaveformData)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateVoiceAnalysis = (): VoiceAnalysis => {
    // stateのtranscriptとrefのtranscriptを両方チェック
    const refTranscript = transcriptRef.current
    const stateTranscript = transcript
    const finalTranscript = stateTranscript || refTranscript // より長い方を使用
    
    const recordingDurationSeconds = startTimeRef.current > 0 ? (Date.now() - startTimeRef.current) / 1000 : 1 // デフォルト1秒
    const recordingDurationMinutes = Math.max(recordingDurationSeconds / 60, 0.01) // 最低0.01分（0.6秒）として計算
    const volumeHistory = volumeHistoryRef.current

    // 話速分析 (文字数/分) - 短時間でも計算可能
    const speechRate = finalTranscript.length > 0 
      ? Math.round(finalTranscript.length / recordingDurationMinutes) 
      : 0
    

    // 音量分析 (1-5点)
    const averageVolume = volumeHistory.length > 0 
      ? volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length 
      : 0
    
    let volume = 3 // デフォルトは適切
    if (averageVolume < 30) volume = 1 // 小さすぎる
    else if (averageVolume < 60) volume = 2 // やや小さい
    else if (averageVolume < 120) volume = 3 // 適切
    else if (averageVolume < 180) volume = 4 // やや大きい
    else volume = 5 // 大きすぎる

    // 声の安定性 (1-10点) - 音量の変動から計算
    let stability = 8 // デフォルト
    if (volumeHistory.length > 10) {
      const variance = volumeHistory.reduce((acc, vol, index, arr) => {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length
        return acc + Math.pow(vol - avg, 2)
      }, 0) / volumeHistory.length
      
      const stdDev = Math.sqrt(variance)
      
      if (stdDev < 10) stability = 9
      else if (stdDev < 20) stability = 8
      else if (stdDev < 30) stability = 7
      else if (stdDev < 40) stability = 6
      else if (stdDev < 50) stability = 5
      else stability = 4
    }

    // 明瞭度 (1-10点) - 話速と音量から推定
    let clarity = 7 // デフォルト
    const optimalSpeechRate = 350 // 適切な話速
    const speechRateDiff = Math.abs(speechRate - optimalSpeechRate)
    
    if (speechRateDiff < 50 && volume === 3) clarity = 9
    else if (speechRateDiff < 100 && volume >= 2 && volume <= 4) clarity = 8
    else if (speechRateDiff < 150) clarity = 7
    else if (speechRateDiff < 200) clarity = 6
    else clarity = 5

    // 音程推定 (1-5点) - 音量と安定性から簡易推定
    let pitch = 3 // デフォルトは普通
    if (averageVolume > 100 && stability >= 7) pitch = 4 // やや高い
    else if (averageVolume > 140) pitch = 5 // 高い
    else if (averageVolume < 50 && stability >= 7) pitch = 2 // やや低い
    else if (averageVolume < 30) pitch = 1 // 低い

    return {
      clarity,
      volume,
      speechRate,
      stability,
      pitch
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const hasMediaRecorder = 'mediaDevices' in navigator && 'MediaRecorder' in window
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    
    setIsSupported(hasMediaRecorder && hasSpeechRecognition)

    if (hasSpeechRecognition) {
      recognitionRef.current = initializeSpeechRecognition()
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      setRecordingTime(0)
      startTimeRef.current = Date.now()
      volumeHistoryRef.current = []
      
      // マイクアクセス許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

      // Web Audio API セットアップ
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      
      // 定期的な音声分析開始
      analysisIntervalRef.current = setInterval(analyzeAudio, 100)
      
      // 波形更新開始
      waveformIntervalRef.current = setInterval(updateWaveform, 50)
      
      // タイマー開始
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          // 5分（300秒）で自動停止
          if (newTime >= 300) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)

      // MediaRecorder の設定
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        
        // すぐに音声分析を実行（transcript stateまたはrefのどちらかにデータがあれば）
        const currentTranscript = transcript || transcriptRef.current
        if (currentTranscript.length > 0) {
          const voiceAnalysis = calculateVoiceAnalysis()
          if (onVoiceAnalysis) {
            onVoiceAnalysis(voiceAnalysis)
          }
        } else {
          pendingAnalysisRef.current = true
          setPendingAnalysis(true)
          
          // フォールバック: 1.5秒後に強制的に音声分析を実行
          setTimeout(() => {
            if (pendingAnalysisRef.current) {
              pendingAnalysisRef.current = false
              setPendingAnalysis(false)
              const voiceAnalysis = calculateVoiceAnalysis()
              if (onVoiceAnalysis) {
                onVoiceAnalysis(voiceAnalysis)
              }
            }
          }, 1500)
        }
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop())
        
        // すべてのインターバルをクリア
        clearAllIntervals()
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // 1秒ごとにデータを取得

      // 音声認識開始
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      setIsRecording(true)
      setIsPaused(false)
      onRecordingStateChange(true)

    } catch (err) {
      console.error('録音開始エラー:', err)
      setError('マイクへのアクセス許可が必要です')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    // タイマーと波形更新を停止
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current)
      waveformIntervalRef.current = null
    }
    
    setIsPaused(true)
    setWaveformData(new Array(50).fill(0)) // 波形をクリア
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
    }
    
    // 音声認識を再開
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
    
    // タイマーと波形更新を再開
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1
        if (newTime >= 300) {
          stopRecording()
        }
        return newTime
      })
    }, 1000)
    
    waveformIntervalRef.current = setInterval(updateWaveform, 50)
    
    setIsPaused(false)
  }

  const clearAllIntervals = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
      analysisIntervalRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current)
      waveformIntervalRef.current = null
    }
    
    // AudioContextをクリーンアップ
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.stop()
      }
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setIsRecording(false)
    setIsPaused(false)
    setWaveformData(new Array(50).fill(0))
    onRecordingStateChange(false)
    
    clearAllIntervals()
  }


  const clearTranscript = () => {
    transcriptRef.current = ''
    setTranscript('')
    onTranscriptChange('')
    setError(null)
    setRecordingTime(0)
    setWaveformData(new Array(50).fill(0))
    setAudioBlob(null)
    chunksRef.current = []
    
    // 音声認識をリセット
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = initializeSpeechRecognition()
    }
    
    // メインページの状態もリセット
    if (onClear) {
      onClear()
    }
  }

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        setError('音声の再生に失敗しました')
      }
      
      audio.play().catch(err => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
        setError('音声の再生に失敗しました')
      })
    } else if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">
          お使いのブラウザは音声録音機能に対応していません。
          <br />
          Chrome、Firefox、Safari の最新版をご利用ください。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 録音時間とステータス */}
      {(isRecording || isPaused || recordingTime > 0) && (
        <div className="text-center space-y-2">
          <div className="text-2xl font-mono text-gray-800">
            {formatTime(recordingTime)}
            {recordingTime >= 300 && <span className="text-red-500 ml-2">最大時間に到達</span>}
          </div>
          <div className="text-sm text-gray-600">
            {isRecording && !isPaused && '🔴 録音中...'}
            {isPaused && '⏸️ 一時停止中'}
            {!isRecording && recordingTime > 0 && '⏹️ 録音完了'}
          </div>
        </div>
      )}

      {/* 音声波形表示 */}
      {(isRecording || isPaused) && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-end justify-center space-x-1 h-20">
            {waveformData.map((amplitude, index) => (
              <div
                key={index}
                className="bg-blue-400 rounded-t transition-all duration-75"
                style={{
                  height: `${Math.max(2, amplitude * 60)}px`,
                  width: '3px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 録音コントロール */}
      <div className="text-center space-y-3">
        {!isRecording && !isPaused && !audioBlob ? (
          // 録音開始状態
          <button
            onClick={startRecording}
            disabled={!isSupported}
            className="px-8 py-4 rounded-full font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎤 録音開始
          </button>
        ) : !isRecording && !isPaused && audioBlob ? (
          // 録音完了状態 - 再録音・再生ボタン
          <div className="flex gap-3 justify-center">
            <button
              onClick={clearTranscript}
              className="px-6 py-3 rounded-md font-medium transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700"
            >
              🔄 再録音
            </button>
            <button
              onClick={playRecording}
              disabled={!audioBlob}
              className="px-6 py-3 rounded-md font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? '⏸️ 停止' : '▶️ 再生'}
            </button>
          </div>
        ) : (
          // 録音中・一時停止中の制御
          <div className="flex gap-3 justify-center">
            {isRecording && !isPaused && (
              <>
                <button
                  onClick={pauseRecording}
                  className="px-6 py-3 rounded-md font-medium transition-all duration-200 bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  ⏸️ 一時停止
                </button>
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-md font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700"
                >
                  ⏹️ 停止
                </button>
              </>
            )}
            
            {isPaused && (
              <>
                <button
                  onClick={resumeRecording}
                  className="px-6 py-3 rounded-md font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700"
                >
                  ▶️ 再開
                </button>
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-md font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700"
                >
                  ⏹️ 停止
                </button>
              </>
            )}
          </div>
        )}
        
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 文字起こし結果 */}
      {transcript && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700">文字起こし結果</h4>
            {!audioBlob && (
              <button
                onClick={clearTranscript}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                クリア
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value)
              onTranscriptChange(e.target.value)
            }}
            className="w-full p-4 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="文字起こし結果がここに表示されます..."
          />
          <p className="text-sm text-gray-500 text-right">
            文字数: {transcript.length} 文字
          </p>
        </div>
      )}
    </div>
  )
}

// TypeScript の型定義を追加
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}