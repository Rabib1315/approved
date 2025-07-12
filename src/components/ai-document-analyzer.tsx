"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Sparkles,
  Loader2,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentAnalysis {
  documentType: string
  completeness: number
  quality: number
  issues: string[]
  recommendations: string[]
  validity: boolean
  expiryDate?: string
  nextSteps: string[]
}

export const AIDocumentAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const { toast } = useToast()

  const analyzeDocuments = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai-document-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to analyze documents")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      
      toast({
        title: "✅ Analysis Complete",
        description: "Your documents have been analyzed successfully!",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to analyze documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">AI Document Analyzer</h2>
        </div>
        <p className="text-muted-foreground">
          Get AI-powered insights on your uploaded documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Analysis
          </CardTitle>
          <CardDescription>
            Analyze your uploaded documents for completeness, quality, and compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={analyzeDocuments}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Documents...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Documents
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getQualityColor(analysis.completeness)}`}>
                    {analysis.completeness}%
                  </div>
                  <div className="text-sm text-gray-600">Completeness</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getQualityColor(analysis.quality)}`}>
                    {analysis.quality}%
                  </div>
                  <div className="text-sm text-gray-600">Quality</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.issues.length}
                  </div>
                  <div className="text-sm text-gray-600">Issues Found</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-medium">{analysis.documentType}</span>
                {getQualityBadge(analysis.quality)}
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-800">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Document Validity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="font-medium">Document Status</span>
                <Badge className={analysis.validity ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {analysis.validity ? "Valid" : "Invalid/Expired"}
                </Badge>
              </div>
              {analysis.expiryDate && (
                <div className="mt-2 text-sm text-gray-600">
                  Expiry Date: {analysis.expiryDate}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 