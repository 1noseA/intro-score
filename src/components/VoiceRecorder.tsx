'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceAnalysis {
  clarity: number // 1-10点
  volume: number // 1-5点 (1:小さすぎる, 2:やや小さい, 3:適切, 4:やや大きい, 5:大きすぎる)
  speechRate: number // 文字/分
  stability: number // 1-10点 (声の安定性)
}

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
  onVoiceAnalysis?: (analysis: VoiceAnalysis) => void
  onClear?: () => void
}

export default function VoiceRecorder({ onTranscriptChange, onRecordingStateChange, onVoiceAnalysis, onClear }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      if (finalTranscript) {
        transcriptRef.current += finalTranscript
        setTranscript(transcriptRef.current)
        onTranscriptChange(transcriptRef.current + interimTranscript)
      } else {
        onTranscriptChange(transcriptRef.current + interimTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setError(`音声認識エラー: ${event.error}`)
    }

    recognition.onend = () => {
      if (isRecording) {
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            recognitionRef.current.start()
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

  const calculateVoiceAnalysis = (): VoiceAnalysis => {
    const transcript = transcriptRef.current
    const recordingDuration = startTimeRef.current > 0 ? (Date.now() - startTimeRef.current) / 1000 / 60 : 1 // 分
    const volumeHistory = volumeHistoryRef.current

    // 話速分析 (文字数/分)
    const speechRate = Math.round(transcript.length / recordingDuration)

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

    return {
      clarity,
      volume,
      speechRate,
      stability
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
        console.log('録音完了:', audioBlob)
        
        // 音声分析結果を計算
        const voiceAnalysis = calculateVoiceAnalysis()
        if (onVoiceAnalysis) {
          onVoiceAnalysis(voiceAnalysis)
        }
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop())
        
        // AudioContextをクリーンアップ
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        
        // 分析インターバルをクリア
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current)
          analysisIntervalRef.current = null
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // 1秒ごとにデータを取得

      // 音声認識開始
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      setIsRecording(true)
      onRecordingStateChange(true)

    } catch (err) {
      console.error('録音開始エラー:', err)
      setError('マイクへのアクセス許可が必要です')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setIsRecording(false)
    onRecordingStateChange(false)
  }

  const clearTranscript = () => {
    transcriptRef.current = ''
    setTranscript('')
    onTranscriptChange('')
    setError(null)
    
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
      {/* 録音コントロール */}
      <div className="text-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isSupported}
          className={`px-8 py-4 rounded-full font-medium transition-all duration-200 ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg transform scale-105' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <>
              <span className="inline-block w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
              🔴 録音停止
            </>
          ) : (
            '🎤 録音開始'
          )}
        </button>
        
        {isRecording && (
          <p className="text-sm text-gray-600 mt-2">
            録音中... 自己紹介をお話しください
          </p>
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
            <button
              onClick={clearTranscript}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              クリア
            </button>
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
          <p className="text-sm text-gray-500">
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