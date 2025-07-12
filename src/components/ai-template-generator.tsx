"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Loader2,
  CheckCircle,
  Brain
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TemplateData {
  program: string
  institution: string
  country: string
  background: string
  goals: string
}

interface GeneratedTemplate {
  statementOfPurpose: string
  resumeTemplate: string
  coverLetter: string
  documentChecklist: string[]
  tips: string[]
}

export const AITemplateGenerator = () => {
  const [formData, setFormData] = useState<TemplateData>({
    program: "",
    institution: "",
    country: "",
    background: "",
    goals: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null)
  const { toast } = useToast()

  const handleInputChange = (field: keyof TemplateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateTemplate = async () => {
    if (!formData.program || !formData.institution) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill in at least the program and institution fields.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate template")
      }

      const data = await response.json()
      setGeneratedTemplate(data.template)
      
      toast({
        title: "✅ Template Generated",
        description: "Your personalized application template is ready!",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to generate template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "✅ Copied",
      description: `${type} copied to clipboard`,
    })
  }

  const downloadTemplate = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "✅ Downloaded",
      description: `${filename} downloaded successfully`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">AI Template Generator</h2>
        </div>
        <p className="text-muted-foreground">
          Generate personalized application templates based on your profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>
              Tell us about your background and goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="program">Program of Study *</Label>
              <Input
                id="program"
                placeholder="e.g., Master of Computer Science"
                value={formData.program}
                onChange={(e) => handleInputChange("program", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                placeholder="e.g., University of Toronto"
                value={formData.institution}
                onChange={(e) => handleInputChange("institution", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="country">Country of Origin</Label>
              <Input
                id="country"
                placeholder="e.g., India"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="background">Academic/Professional Background</Label>
              <Textarea
                id="background"
                placeholder="Briefly describe your educational background, work experience, and achievements..."
                value={formData.background}
                onChange={(e) => handleInputChange("background", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="goals">Career Goals</Label>
              <Textarea
                id="goals"
                placeholder="What are your career goals and how does this program help achieve them?"
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={generateTemplate}
              disabled={isGenerating || !formData.program || !formData.institution}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Template...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Template
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Generated Template
            </CardTitle>
            <CardDescription>
              Your personalized application materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedTemplate ? (
              <div className="space-y-4">
                {/* Statement of Purpose */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Statement of Purpose</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedTemplate.statementOfPurpose, "Statement of Purpose")}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadTemplate(generatedTemplate.statementOfPurpose, "statement-of-purpose.txt")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                    {generatedTemplate.statementOfPurpose}
                  </div>
                </div>

                <Separator />

                {/* Resume Template */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Resume Template</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedTemplate.resumeTemplate, "Resume Template")}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadTemplate(generatedTemplate.resumeTemplate, "resume-template.txt")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-32 overflow-y-auto">
                    {generatedTemplate.resumeTemplate}
                  </div>
                </div>

                <Separator />

                {/* Document Checklist */}
                <div>
                  <h4 className="font-semibold mb-2">Required Documents</h4>
                  <div className="space-y-1">
                    {generatedTemplate.documentChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Tips */}
                <div>
                  <h4 className="font-semibold mb-2">Application Tips</h4>
                  <div className="space-y-2">
                    {generatedTemplate.tips.map((tip, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded-md text-sm">
                        💡 {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill out your profile and generate a personalized template</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 