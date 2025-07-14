"use client"

import { useState } from "react"
import { debugDocuments, testAIExtraction } from "@/actions/debug-actions"
import { debugPDFExtraction } from "@/actions/debug-pdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DebugPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [pdfResult, setPdfResult] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleDebugDocuments = async () => {
    setLoading("documents")
    try {
      const result = await debugDocuments()
      setDebugResult(result)
    } catch (error) {
      console.error("Debug error:", error)
      setDebugResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(null)
    }
  }

  const handleTestAI = async () => {
    setLoading("ai")
    try {
      const result = await testAIExtraction()
      setAiResult(result)
    } catch (error) {
      console.error("AI test error:", error)
      setAiResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(null)
    }
  }

  const handleTestPDF = async () => {
    setLoading("pdf")
    try {
      const result = await debugPDFExtraction()
      setPdfResult(result)
    } catch (error) {
      console.error("PDF test error:", error)
      setPdfResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Debug Document Processing</h1>
          <p className="text-gray-600 mt-2">Test document upload, text extraction, and AI processing</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button
            onClick={handleDebugDocuments}
            disabled={loading !== null}
            className="h-16 text-lg"
            variant="outline"
          >
            {loading === "documents" ? <LoadingSpinner className="mr-2" /> : null}
            Debug Documents
          </Button>
          
          <Button
            onClick={handleTestAI}
            disabled={loading !== null}
            className="h-16 text-lg"
            variant="outline"
          >
            {loading === "ai" ? <LoadingSpinner className="mr-2" /> : null}
            Test AI Extraction
          </Button>
          
          <Button
            onClick={handleTestPDF}
            disabled={loading !== null}
            className="h-16 text-lg"
            variant="outline"
          >
            {loading === "pdf" ? <LoadingSpinner className="mr-2" /> : null}
            Test PDF Extraction
          </Button>
        </div>

        <div className="space-y-6">
          {debugResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Document Debug Results
                  <Badge variant={debugResult.success ? "default" : "destructive"}>
                    {debugResult.success ? "Success" : "Failed"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document Count</p>
                    <p className="text-lg font-semibold">{debugResult.documentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Text Length</p>
                    <p className="text-lg font-semibold">{debugResult.totalTextLength}</p>
                  </div>
                </div>
                
                {debugResult.documents && (
                  <div>
                    <h3 className="font-semibold mb-2">Documents:</h3>
                    <div className="space-y-2">
                      {debugResult.documents.map((doc: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>Type:</strong> {doc.type}</div>
                            <div><strong>Text Length:</strong> {doc.textLength}</div>
                            <div className="col-span-2"><strong>Filename:</strong> {doc.filename}</div>
                            <div className="col-span-2">
                              <strong>Preview:</strong>
                              <p className="text-gray-600 text-xs mt-1 font-mono">{doc.textPreview}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {debugResult.textPreview && (
                  <div>
                    <h3 className="font-semibold mb-2">Text Preview:</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40 whitespace-pre-wrap">
                      {debugResult.textPreview}
                    </pre>
                  </div>
                )}

                {debugResult.error && (
                  <div className="text-red-600 bg-red-50 p-3 rounded">
                    <strong>Error:</strong> {debugResult.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {aiResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  AI Extraction Test Results
                  <Badge variant={aiResult.success ? "default" : "destructive"}>
                    {aiResult.success ? "Success" : "Failed"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document Count</p>
                    <p className="text-lg font-semibold">{aiResult.documentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Text Length</p>
                    <p className="text-lg font-semibold">{aiResult.textLength}</p>
                  </div>
                </div>
                
                {aiResult.aiResult && (
                  <div>
                    <h3 className="font-semibold mb-2">AI Result:</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60 whitespace-pre-wrap">
                      {JSON.stringify(aiResult.aiResult, null, 2)}
                    </pre>
                  </div>
                )}
                
                {aiResult.error && (
                  <div className="text-red-600 bg-red-50 p-3 rounded">
                    <strong>Error:</strong> {aiResult.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {pdfResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  PDF Extraction Test Results
                  <Badge variant={pdfResult.success ? "default" : "destructive"}>
                    {pdfResult.success ? "Success" : "Failed"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document ID</p>
                    <p className="text-lg font-semibold">{pdfResult.documentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Original Text Length</p>
                    <p className="text-lg font-semibold">{pdfResult.originalTextLength}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New Text Length</p>
                    <p className="text-lg font-semibold">{pdfResult.newTextLength}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold">{pdfResult.message}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Filename</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{pdfResult.filename}</p>
                </div>
                
                {pdfResult.textPreview && (
                  <div>
                    <h3 className="font-semibold mb-2">Extracted Text Preview:</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40 whitespace-pre-wrap">
                      {pdfResult.textPreview}
                    </pre>
                  </div>
                )}
                
                {pdfResult.error && (
                  <div className="text-red-600 bg-red-50 p-3 rounded">
                    <strong>Error:</strong> {pdfResult.error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 