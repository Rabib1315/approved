import { cleanupInvalidDocuments } from "@/actions/cleanup-actions"

export default async function CleanupPage() {
  const result = await cleanupInvalidDocuments()
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Document Cleanup</h1>
      
      {result.success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Cleanup Completed</h2>
          <div className="space-y-1 text-green-700">
            <p>Total documents: {result.total}</p>
            <p>Valid documents: {result.valid}</p>
            <p>Deleted records: {result.deleted}</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Cleanup Failed</h2>
          <p className="text-red-700">{result.error}</p>
        </div>
      )}
      
      <div className="mt-4">
        <a 
          href="/review" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go to Review Page
        </a>
      </div>
    </div>
  )
} 