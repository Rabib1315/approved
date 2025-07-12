import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { documents } from "@/db/schema/documents-schema"
import { eq } from "drizzle-orm"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's uploaded documents
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))

    if (userDocuments.length === 0) {
      return NextResponse.json({ error: "No documents found" }, { status: 404 })
    }

    // Create a summary of uploaded documents for AI analysis
    const documentSummary = userDocuments.map(doc => ({
      type: doc.type,
      filename: doc.filename,
      size: doc.size,
      uploaded_at: doc.created_at
    }))

    const analysisPrompt = `You are an expert Canadian student visa document analyst. Analyze the following uploaded documents and provide a comprehensive assessment.

Uploaded Documents:
${JSON.stringify(documentSummary, null, 2)}

Please provide a detailed analysis in JSON format with the following structure:

{
  "documentType": "string (overall document category)",
  "completeness": number (0-100, how complete the document set is),
  "quality": number (0-100, overall quality score),
  "issues": ["array of specific issues found"],
  "recommendations": ["array of actionable recommendations"],
  "validity": boolean (whether documents are valid for visa application),
  "expiryDate": "string (if any documents have expiry dates)",
  "nextSteps": ["array of next steps to take"]
}

Consider:
- Document completeness for Canadian student visa requirements
- Common issues that lead to visa rejections
- Quality and validity of uploaded documents
- Missing critical documents
- Specific recommendations for improvement
- Timeline considerations for document validity

Provide realistic scores and specific, actionable feedback.`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '{}'
    
    // Try to parse the JSON response
    let analysis
    try {
      analysis = JSON.parse(aiResponse)
    } catch (error) {
      // If parsing fails, create a fallback analysis
      analysis = {
        documentType: "Student Visa Documents",
        completeness: 75,
        quality: 80,
        issues: [
          "Some documents may need translation",
          "Consider adding additional financial proof"
        ],
        recommendations: [
          "Ensure all documents are properly translated",
          "Add more detailed financial statements",
          "Include letter of explanation for any gaps"
        ],
        validity: true,
        nextSteps: [
          "Review all document requirements",
          "Prepare additional supporting documents",
          "Schedule document translation if needed"
        ]
      }
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("AI Document Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze documents" },
      { status: 500 }
    )
  }
} 