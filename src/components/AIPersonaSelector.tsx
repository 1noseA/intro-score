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
    id: 'tech-mentor',
    type: 'preset',
    name: '技術メンター',
    description: '技術スキルを重視する評価',
    prompt: '経験豊富な技術メンターとして評価してください。技術的な知識の深さ、実装経験、問題解決能力を重視して評価します。新しい技術への興味や学習意欲も大切にします。技術者としての成長を真剣に考える先輩エンジニアの視点でお願いします。'
  },
  {
    id: 'team-leader',
    type: 'preset',
    name: 'チームリーダー',
    description: 'チームワークとコミュニケーションを重視',
    prompt: 'チームリーダーとして評価してください。コミュニケーション能力、協調性、リーダーシップの素質を重視します。技術力だけでなく、チームをまとめる力、他のメンバーとうまく働ける人間性を見極める視点でお願いします。'
  },
  {
    id: 'hr-interviewer',
    type: 'preset',
    name: 'HR面接官',
    description: '総合的な人物評価を重視',
    prompt: 'HR面接官として評価してください。技術力だけでなく、人柄、コミュニケーション能力、組織への適応性、長期的な成長可能性を総合的に判断します。会社の文化にフィットし、長く活躍できる人材かという視点でお願いします。'
  },
  {
    id: 'peer-engineer',
    type: 'preset',
    name: '同期エンジニア',
    description: '親しみやすさとカジュアルさを重視',
    prompt: '同期のエンジニアとして評価してください。一緒に働いて楽しそうか、親しみやすいか、気軽に相談できる人かを重視します。技術的な話も気楽にできて、お互いに高め合える関係が築けそうかという視点でお願いします。'
  },
  {
    id: 'senior-engineer',
    type: 'preset',
    name: 'シニアエンジニア',
    description: '経験と知識の深さを重視',
    prompt: '10年以上の経験を持つシニアエンジニアとして評価してください。技術の深い理解、アーキテクチャ設計能力、複雑な問題への対応力を重視します。技術的な判断力や、ジュニアメンバーを指導できる知識の深さという視点でお願いします。'
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
            className={`p-4 rounded-lg border text-left transition-colors ${
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
          className={`p-4 rounded-lg border text-left transition-colors border-dashed ${
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