"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { testClaudeConnection, assessApplication, generateRecommendations, checkDocumentCompleteness } from "@/actions/ai-actions"
import { createTestData, getTestApplicationId } from "@/actions/test-setup"
import { useToast } from "@/hooks/use-toast"

export default function AITestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testClaudeConnection()
      setResults({ type: "connection", data: result })
      
      if (result.success) {
        toast({
          title: "✅ Claude AI Connected",
          description: result.message,
        })
      } else {
        toast({
          title: "❌ Connection Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to test Claude AI connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssessApplication = async () => {
    setIsLoading(true)
    try {
      // Get or create test application
      let applicationId: number | null = await getTestApplicationId()
      if (!applicationId) {
        const testData = await createTestData()
        if (testData.success) {
          applicationId = testData.applicationId ?? null
        } else {
          throw new Error("Failed to create test data")
        }
      }
      
      if (!applicationId) {
        throw new Error("No application found")
      }
      
      const result = await assessApplication(applicationId)
      setResults({ type: "assessment", data: result })
      
      toast({
        title: "✅ Application Assessed",
        description: `Overall Score: ${result.overallScore}/100`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to assess application. Make sure you have an application created.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    setIsLoading(true)
    try {
      // Get or create test application
      let applicationId = await getTestApplicationId()
      if (!applicationId) {
        const testData = await createTestData()
        if (testData.success) {
          applicationId = testData.applicationId ?? null
        } else {
          throw new Error("Failed to create test data")
        }
      }
      
      if (!applicationId) {
        throw new Error("No application found")
      }
      
      const result = await generateRecommendations(applicationId)
      setResults({ type: "recommendations", data: result })
      
      toast({
        title: "✅ Recommendations Generated",
        description: `${result.nextSteps.length} next steps provided`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate recommendations. Make sure you have an application created.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckCompleteness = async () => {
    setIsLoading(true)
    try {
      // Get or create test application
      let applicationId = await getTestApplicationId()
      if (!applicationId) {
        const testData = await createTestData()
        if (testData.success) {
          applicationId = testData.applicationId ?? null
        } else {
          throw new Error("Failed to create test data")
        }
      }
      
      if (!applicationId) {
        throw new Error("No application found")
      }
      
      const result = await checkDocumentCompleteness(applicationId)
      setResults({ type: "completeness", data: result })
      
      toast({
        title: "✅ Completeness Checked",
        description: `Completeness Score: ${result.completenessScore}/100`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to check completeness. Make sure you have an application created.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderResults = () => {
    if (!results) return null

    switch (results.type) {
      case "connection":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Connection Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={results.data.success ? "default" : "destructive"}>
                    {results.data.success ? "Connected" : "Failed"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{results.data.message}</p>
              </div>
            </CardContent>
          </Card>
        )

      case "assessment":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Application Assessment</CardTitle>
              <CardDescription>AI-powered analysis of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{results.data.overallScore}/100</span>
                <Badge variant={results.data.confidenceLevel === "high" ? "default" : results.data.confidenceLevel === "medium" ? "secondary" : "destructive"}>
                  {results.data.confidenceLevel} confidence
                </Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Strength Areas</h4>
                <div className="space-y-1">
                  {results.data.strengthAreas.map((strength: string, index: number) => (
                    <div key={index} className="text-sm text-green-600">• {strength}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                <div className="space-y-1">
                  {results.data.weaknessAreas.map((weakness: string, index: number) => (
                    <div key={index} className="text-sm text-orange-600">• {weakness}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <div className="space-y-1">
                  {results.data.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="text-sm">• {rec}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Risk Factors</h4>
                <div className="space-y-1">
                  {results.data.riskFactors.map((risk: string, index: number) => (
                    <div key={index} className="text-sm text-red-600">• {risk}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "recommendations":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>AI-generated guidance for your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Next Steps</h4>
                <div className="space-y-1">
                  {results.data.nextSteps.map((step: string, index: number) => (
                    <div key={index} className="text-sm">• {step}</div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Document Improvements</h4>
                <div className="space-y-1">
                  {results.data.documentImprovements.map((improvement: string, index: number) => (
                    <div key={index} className="text-sm">• {improvement}</div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Application Enhancements</h4>
                <div className="space-y-1">
                  {results.data.applicationEnhancements.map((enhancement: string, index: number) => (
                    <div key={index} className="text-sm">• {enhancement}</div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Timeline Suggestions</h4>
                <div className="space-y-1">
                  {results.data.timelineSuggestions.map((timeline: string, index: number) => (
                    <div key={index} className="text-sm">• {timeline}</div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Risk Mitigation</h4>
                <div className="space-y-1">
                  {results.data.riskMitigation.map((mitigation: string, index: number) => (
                    <div key={index} className="text-sm">• {mitigation}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "completeness":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Document Completeness Check</CardTitle>
              <CardDescription>Analysis of required documents for Canadian student visa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{results.data.completenessScore}/100</span>
                <Badge variant={results.data.completenessScore >= 80 ? "default" : results.data.completenessScore >= 60 ? "secondary" : "destructive"}>
                  {results.data.completenessScore >= 80 ? "Complete" : results.data.completenessScore >= 60 ? "Mostly Complete" : "Incomplete"}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Missing Documents</h4>
                <div className="space-y-1">
                  {results.data.missingDocuments.length > 0 ? (
                    results.data.missingDocuments.map((doc: string, index: number) => (
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
                  {results.data.incompleteDocuments.length > 0 ? (
                    results.data.incompleteDocuments.map((doc: string, index: number) => (
                      <div key={index} className="text-sm text-orange-600">• {doc}</div>
                    ))
                  ) : (
                    <div className="text-sm text-green-600">✅ All documents appear complete</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <div className="space-y-1">
                  {results.data.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="text-sm">• {rec}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Claude AI Integration Test</h1>
          <p className="text-muted-foreground">
            Test the Claude AI integration for document analysis, application assessment, and personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
              <CardDescription>Test Claude AI API connection</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Assessment</CardTitle>
              <CardDescription>AI-powered application strength analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAssessApplication} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Assessing..." : "Assess Application"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Recommendations</CardTitle>
              <CardDescription>Get personalized application guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGenerateRecommendations} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Generating..." : "Generate Recommendations"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check Completeness</CardTitle>
              <CardDescription>Verify document requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCheckCompleteness} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Checking..." : "Check Completeness"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {renderResults()}
      </div>
    </div>
  )
} 