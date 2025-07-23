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
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚧 開発中
            </h2>
            <p className="text-gray-600">
              現在、アプリケーションの基盤を構築中です。<br />
              近日中にサービスを開始予定です。
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}