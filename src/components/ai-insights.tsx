"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Sparkles,
  Loader2
} from "lucide-react"
import { assessApplication, generateRecommendations, checkDocumentCompleteness } from "@/actions/ai-actions"
import { useToast } from "@/hooks/use-toast"

interface AIInsightsProps {
  applicationId: number
  showAssessment?: boolean
  showRecommendations?: boolean
  showCompleteness?: boolean
}

export const AIInsights = ({ 
  applicationId, 
  showAssessment = true, 
  showRecommendations = true, 
  showCompleteness = true 
}: AIInsightsProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [assessment, setAssessment] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [completeness, setCompleteness] = useState<any>(null)
  const { toast } = useToast()

  const handleAssessApplication = async () => {
    setIsLoading(true)
    try {
      const result = await assessApplication(applicationId)
      setAssessment(result)
      toast({
        title: "✅ Application Assessed",
        description: `Overall Score: ${result.overallScore}/100`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to assess application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    setIsLoading(true)
    try {
      const result = await generateRecommendations(applicationId)
      setRecommendations(result)
      toast({
        title: "✅ Recommendations Generated",
        description: `${result.nextSteps.length} next steps provided`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckCompleteness = async () => {
    setIsLoading(true)
    try {
      const result = await checkDocumentCompleteness(applicationId)
      setCompleteness(result)
      toast({
        title: "✅ Completeness Checked",
        description: `Completeness Score: ${result.completenessScore}/100`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to check completeness",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
      </div>

      {/* Application Assessment */}
      {showAssessment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Application Assessment
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your application strength
                </CardDescription>
              </div>
              {!assessment && (
                <Button 
                  onClick={handleAssessApplication} 
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {assessment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                      {assessment.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Strength Level</span>
                      <Badge variant={getScoreVariant(assessment.overallScore)}>
                        {assessment.confidenceLevel} confidence
                      </Badge>
                    </div>
                    <Progress value={assessment.overallScore} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Strengths
                    </h4>
                    <div className="space-y-1">
                      {assessment.strengthAreas.slice(0, 3).map((strength: string, index: number) => (
                        <div key={index} className="text-sm text-green-600">• {strength}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      Areas to Improve
                    </h4>
                    <div className="space-y-1">
                      {assessment.weaknessAreas.slice(0, 3).map((weakness: string, index: number) => (
                        <div key={index} className="text-sm text-orange-600">• {weakness}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Analyze" to get AI-powered assessment of your application</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Completeness */}
      {showCompleteness && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document Completeness
                </CardTitle>
                <CardDescription>
                  Check if all required documents are uploaded
                </CardDescription>
              </div>
              {!completeness && (
                <Button 
                  onClick={handleCheckCompleteness} 
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Check
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {completeness ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(completeness.completenessScore)}`}>
                      {completeness.completenessScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                  <div className="flex-1">
                    <Progress value={completeness.completenessScore} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Missing Documents</h4>
                    <div className="space-y-1">
                      {completeness.missingDocuments.length > 0 ? (
                        completeness.missingDocuments.slice(0, 3).map((doc: string, index: number) => (
                          <div key={index} className="text-sm text-red-600">• {doc}</div>
                        ))
                      ) : (
                        <div className="text-sm text-green-600">✅ All required documents uploaded</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Incomplete Documents</h4>
                    <div className="space-y-1">
                      {completeness.incompleteDocuments.length > 0 ? (
                        completeness.incompleteDocuments.slice(0, 3).map((doc: string, index: number) => (
                          <div key={index} className="text-sm text-orange-600">• {doc}</div>
                        ))
                      ) : (
                        <div className="text-sm text-green-600">✅ All documents appear complete</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Check" to verify document completeness</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {showRecommendations && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated guidance for your application
                </CardDescription>
              </div>
              {!recommendations && (
                <Button 
                  onClick={handleGenerateRecommendations} 
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recommendations ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Next Steps
                    </h4>
                    <div className="space-y-1">
                      {recommendations.nextSteps.slice(0, 3).map((step: string, index: number) => (
                        <div key={index} className="text-sm">• {step}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Document Improvements</h4>
                    <div className="space-y-1">
                      {recommendations.documentImprovements.slice(0, 3).map((improvement: string, index: number) => (
                        <div key={index} className="text-sm">• {improvement}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Application Enhancements</h4>
                  <div className="space-y-1">
                    {recommendations.applicationEnhancements.slice(0, 3).map((enhancement: string, index: number) => (
                      <div key={index} className="text-sm">• {enhancement}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate" to get personalized recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 