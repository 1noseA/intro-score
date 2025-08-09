'use client'

import { useState } from 'react'

export interface AIPersona {
  id: string
  type: 'preset' | 'custom'
  name: string
  description: string
  prompt: string
}

interface AIPersonaSelectorProps {
  selectedPersona: AIPersona | null
  onPersonaChange: (persona: AIPersona | null) => void
}

const PRESET_PERSONAS: AIPersona[] = [
  {
    id: 'team-member',
    type: 'preset',
    name: 'チームメンバー',
    description: '日常的な協働を重視、親しみやすさとコミュニケーション能力を評価',
    prompt: '同じチームで働くメンバーとして評価してください。日常的に一緒に作業することを想定し、親しみやすさ、コミュニケーションの取りやすさ、協調性を重視します。技術的な相談がしやすく、チーム内での良好な関係を築けるかという視点でお願いします。'
  },
  {
    id: 'company-event',
    type: 'preset',
    name: '社内イベントの懇親会',
    description: 'カジュアルな雰囲気での人柄や趣味、親近感を重視',
    prompt: '社内の懇親会に参加している社員として評価してください。カジュアルな場での人柄の良さ、趣味や興味の共有、親近感の持ちやすさを重視します。リラックスした雰囲気で話しやすく、プライベートでも付き合いたくなるような人柄かという視点でお願いします。'
  },
  {
    id: 'external-engineer',
    type: 'preset',
    name: '社外のエンジニア',
    description: '技術的な知識や経験の共有、プロフェッショナルな印象を評価',
    prompt: '社外のエンジニアとして評価してください。技術的な知識や経験の深さ、プロフェッショナルとしての印象、技術コミュニティでの信頼性を重視します。技術的な議論ができ、お互いに学び合える関係を築けるかという視点でお願いします。'
  },
  // {
  //   id: 'tech-event-audience',
  //   type: 'preset',
  //   name: '技術イベントの聴衆',
  //   description: 'プレゼンテーション能力、技術への情熱、わかりやすさを重視',
  //   prompt: '技術イベントの聴衆として評価してください。プレゼンテーション能力、技術への情熱の伝わりやすさ、内容のわかりやすさを重視します。技術的な内容を魅力的に伝えられ、聞いていて興味深いと感じられるかという視点でお願いします。'
  // },
  {
    id: 'client-meeting-pl',
    type: 'preset',
    name: '客先面談のPL',
    description: 'ビジネス的な信頼性、技術力の説得力、プロジェクト推進力を評価',
    prompt: '客先面談に参加するプロジェクトリーダーとして評価してください。ビジネス的な信頼性、技術力の説得力、プロジェクトを推進する能力を重視します。クライアントに安心感を与え、技術的な課題を解決してくれそうだと思わせる人材かという視点でお願いします。'
  },
  {
    id: 'job-interviewer',
    type: 'preset',
    name: '転職の面接官',
    description: '総合的なスキル、経験、企業適性、将来性を厳格に評価',
    prompt: '転職面接の面接官として評価してください。総合的な技術スキル、これまでの経験、企業への適性、将来的な成長可能性を厳格に評価します。即戦力としての能力と、長期的に組織に貢献できる人材かという視点でお願いします。'
  }
]

export default function AIPersonaSelector({ selectedPersona, onPersonaChange }: AIPersonaSelectorProps) {
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customPersona, setCustomPersona] = useState({
    name: '',
    description: '',
    prompt: ''
  })

  const handlePresetSelect = (persona: AIPersona) => {
    onPersonaChange(persona)
    setShowCustomForm(false)
  }

  const handleCustomSubmit = () => {
    if (customPersona.name && customPersona.prompt) {
      const persona: AIPersona = {
        id: 'custom',
        type: 'custom',
        name: customPersona.name,
        description: customPersona.description || 'カスタム評価者',
        prompt: customPersona.prompt
      }
      onPersonaChange(persona)
      setShowCustomForm(false)
    }
  }

  const handleShowCustomForm = () => {
    setShowCustomForm(true)
    onPersonaChange(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          どんな人に評価してもらいたいかを選択してください
        </p>
      </div>

      {/* プリセット人格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_PERSONAS.map((persona) => (
          <button
            key={persona.id}
            onClick={() => handlePresetSelect(persona)}
            className={`p-4 rounded-lg border text-left transition-colors flex flex-col items-start ${
              selectedPersona?.id === persona.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-800">{persona.name}</div>
            <div className="text-sm text-gray-600 mt-1">{persona.description}</div>
          </button>
        ))}
        
        {/* カスタム人格ボタン */}
        <button
          onClick={handleShowCustomForm}
          className={`p-4 rounded-lg border text-left transition-colors border-dashed flex flex-col items-start ${
            showCustomForm || selectedPersona?.type === 'custom'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="font-medium text-gray-800">✏️ カスタム</div>
          <div className="text-sm text-gray-600 mt-1">独自の評価者を作成</div>
        </button>
      </div>

      {/* カスタム人格フォーム */}
      {showCustomForm && (
        <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <h4 className="font-medium text-gray-800 mb-4">カスタム評価者の設定</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                評価者名
              </label>
              <input
                type="text"
                value={customPersona.name}
                onChange={(e) => setCustomPersona(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例：厳格な先輩エンジニア"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                簡単な説明（任意）
              </label>
              <input
                type="text"
                value={customPersona.description}
                onChange={(e) => setCustomPersona(prev => ({ ...prev, description: e.target.value }))}
                placeholder="例：コードレビューに厳しい"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                評価者の特徴・視点 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customPersona.prompt}
                onChange={(e) => setCustomPersona(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="例：厳しいけど的確なアドバイスをくれる10年目のシニアエンジニア。技術の深さと実装経験を重視して評価してください。コードレビューが得意で、後輩の成長を真剣に考えてくれる先輩のような視点でお願いします。"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                推奨：200-500文字。どんな人物で、どんな視点で評価してほしいかを詳しく書いてください。
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomSubmit}
                disabled={!customPersona.name || !customPersona.prompt}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                設定完了
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}