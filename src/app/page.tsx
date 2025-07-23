import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            intro-score
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI音声分析による自己紹介スキル向上プラットフォーム
          </p>
          <p className="text-gray-500 mb-8">
            エンジニアの自己紹介音声を分析し、カスタムAI人格による評価とフィードバックを提供します
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ✨ サービス開始
            </h2>
            <p className="text-gray-600 mb-6">
              基本的な機能が完成しました。<br />
              アカウントを作成してサービスをお試しください。
            </p>
            <div className="space-y-3">
              <Link 
                href="/auth/signup"
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                アカウント作成
              </Link>
              <Link 
                href="/auth/signin"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                ログイン
              </Link>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>🎤 音声録音 → 🎵 音響分析 → 🤖 AI評価 → 📱 プロフィール生成</p>
          </div>
        </div>
      </div>
    </main>
  )
}