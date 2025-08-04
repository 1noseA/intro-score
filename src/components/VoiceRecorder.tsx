'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  onRecordingStateChange: (isRecording: boolean) => void
}

export default function VoiceRecorder({ onTranscriptChange, onRecordingStateChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // ブラウザサポートチェック（クライアントサイドのみ実行）
    if (typeof window === 'undefined') return
    
    const hasMediaRecorder = 'mediaDevices' in navigator && 'MediaRecorder' in window
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    
    setIsSupported(hasMediaRecorder && hasSpeechRecognition)

    if (hasSpeechRecognition) {
      // Speech Recognition の初期化
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognitionClass()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ja-JP'

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = transcript + finalTranscript
        setTranscript(fullTranscript)
        onTranscriptChange(fullTranscript + interimTranscript)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setError(`音声認識エラー: ${event.error}`)
      }

      recognition.onend = () => {
        if (isRecording) {
          // 録音中に音声認識が停止した場合は再開
          recognition.start()
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [transcript, onTranscriptChange, isRecording])

  const startRecording = async () => {
    try {
      setError(null)
      
      // マイクアクセス許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

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
        // 必要に応じて音声ファイルを処理
        console.log('録音完了:', audioBlob)
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop())
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
    setTranscript('')
    onTranscriptChange('')
    setError(null)
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