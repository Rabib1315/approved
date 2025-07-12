"use server"

import Anthropic from "@anthropic-ai/sdk"
import { requireUserId } from "./auth-actions"
import { db } from "@/db"
import { applications } from "@/db/schema/applications-schema"
import { documents } from "@/db/schema/documents-schema"
import { users } from "@/db/schema/users-schema"
import { eq, and } from "drizzle-orm"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface DocumentAnalysis {
  documentType: string
  completeness: number
  quality: number
  issues: string[]
  recommendations: string[]
  extractedData: Record<string, any>
}

export interface ApplicationAssessment {
  overallScore: number
  strengthAreas: string[]
  weaknessAreas: string[]
  recommendations: string[]
  riskFactors: string[]
  confidenceLevel: "high" | "medium" | "low"
}

export interface PersonalizedRecommendations {
  nextSteps: string[]
  documentImprovements: string[]
  applicationEnhancements: string[]
  timelineSuggestions: string[]
  riskMitigation: string[]
}

/**
 * Analyze uploaded documents using Claude AI
 */
export async function analyzeDocument(documentId: number): Promise<DocumentAnalysis> {
  try {
    const userId = await requireUserId()
    
    // Get document from database
    const document = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.user_id, userId)))
      .limit(1)
    
    if (!document.length) {
      throw new Error("Document not found")
    }

    const doc = document[0]
    
    // For now, we'll analyze based on document metadata
    // In a real implementation, you'd extract text from the uploaded file
    const analysisPrompt = `You are an expert Canadian student visa application reviewer. Analyze the following document:

Document Type: ${doc.type}
Filename: ${doc.filename}
Size: ${doc.size} bytes
Uploaded: ${doc.created_at}

Please provide a comprehensive analysis including:
1. Document completeness (0-100 score)
2. Document quality assessment (0-100 score)
3. Potential issues or missing information
4. Specific recommendations for improvement
5. Extracted key information (dates, names, institutions, etc.)

Format your response as JSON with the following structure:
{
  "completeness": number,
  "quality": number,
  "issues": ["issue1", "issue2"],
  "recommendations": ["rec1", "rec2"],
  "extractedData": {
    "key1": "value1",
    "key2": "value2"
  }
}`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    })

    const analysis = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')
    
    return {
      documentType: doc.type,
      completeness: analysis.completeness,
      quality: analysis.quality,
      issues: analysis.issues || [],
      recommendations: analysis.recommendations || [],
      extractedData: analysis.extractedData || {}
    }
  } catch (error) {
    console.error("Error analyzing document:", error)
    throw new Error("Failed to analyze document")
  }
}

/**
 * Assess overall application strength using Claude AI
 */
export async function assessApplication(applicationId: number): Promise<ApplicationAssessment> {
  try {
    const userId = await requireUserId()
    
    // Get application and user data
    const application = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.user_id, userId)))
      .limit(1)
    
    if (!application.length) {
      throw new Error("Application not found")
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const app = application[0]
    const userData = user[0]

    // Get user's documents
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))

    const assessmentPrompt = `You are an expert Canadian student visa application assessor. Evaluate the following application:

APPLICATION DETAILS:
- Institution: ${app.institution}
- Program: ${app.program}
- Start Date: ${app.start_date}
- Total Cost: ${app.total_cost}
- Current Strength Score: ${app.strength_score || "Not calculated"}

USER PROFILE:
- Name: ${userData?.first_name || ""} ${userData?.last_name || ""}
- Country of Origin: ${userData?.country_of_origin || "Not provided"}
- Current Country: ${userData?.current_country || "Not provided"}
- Phone: ${userData?.phone || "Not provided"}

DOCUMENTS UPLOADED:
${userDocuments.map(doc => `- ${doc.type}: ${doc.filename}`).join('\n')}

Please provide a comprehensive assessment including:
1. Overall application strength score (0-100)
2. Key strength areas
3. Areas of concern or weakness
4. Specific recommendations for improvement
5. Risk factors that could affect approval
6. Confidence level in the assessment (high/medium/low)

Format your response as JSON with the following structure:
{
  "overallScore": number,
  "strengthAreas": ["strength1", "strength2"],
  "weaknessAreas": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"],
  "riskFactors": ["risk1", "risk2"],
  "confidenceLevel": "high|medium|low"
}`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: assessmentPrompt
        }
      ]
    })

    const assessment = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')
    
    // Update application with new strength score
    await db
      .update(applications)
      .set({ 
        strength_score: assessment.overallScore.toString(),
        updated_at: new Date()
      })
      .where(eq(applications.id, applicationId))

    return {
      overallScore: assessment.overallScore,
      strengthAreas: assessment.strengthAreas || [],
      weaknessAreas: assessment.weaknessAreas || [],
      recommendations: assessment.recommendations || [],
      riskFactors: assessment.riskFactors || [],
      confidenceLevel: assessment.confidenceLevel || "medium"
    }
  } catch (error) {
    console.error("Error assessing application:", error)
    throw new Error("Failed to assess application")
  }
}

/**
 * Generate personalized recommendations using Claude AI
 */
export async function generateRecommendations(applicationId: number): Promise<PersonalizedRecommendations> {
  try {
    const userId = await requireUserId()
    
    // Get application and user data
    const application = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, applicationId), eq(applications.user_id, userId)))
      .limit(1)
    
    if (!application.length) {
      throw new Error("Application not found")
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))

    const app = application[0]
    const userData = user[0]

    const recommendationsPrompt = `You are an expert Canadian student visa consultant. Based on the following application, provide personalized recommendations:

APPLICATION:
- Institution: ${app.institution}
- Program: ${app.program}
- Start Date: ${app.start_date}
- Total Cost: ${app.total_cost}
- Strength Score: ${app.strength_score || "Not calculated"}

USER PROFILE:
- Name: ${userData?.first_name || ""} ${userData?.last_name || ""}
- Country of Origin: ${userData?.country_of_origin || "Not provided"}
- Current Country: ${userData?.current_country || "Not provided"}
- Phone: ${userData?.phone || "Not provided"}

DOCUMENTS: ${userDocuments.length} uploaded

Please provide personalized recommendations in these categories:
1. Next immediate steps to take
2. Document improvements needed
3. Application enhancements
4. Timeline suggestions
5. Risk mitigation strategies

Format your response as JSON with the following structure:
{
  "nextSteps": ["step1", "step2"],
  "documentImprovements": ["improvement1", "improvement2"],
  "applicationEnhancements": ["enhancement1", "enhancement2"],
  "timelineSuggestions": ["timeline1", "timeline2"],
  "riskMitigation": ["mitigation1", "mitigation2"]
}`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: recommendationsPrompt
        }
      ]
    })

    const recommendations = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')
    
    return {
      nextSteps: recommendations.nextSteps || [],
      documentImprovements: recommendations.documentImprovements || [],
      applicationEnhancements: recommendations.applicationEnhancements || [],
      timelineSuggestions: recommendations.timelineSuggestions || [],
      riskMitigation: recommendations.riskMitigation || []
    }
  } catch (error) {
    console.error("Error generating recommendations:", error)
    throw new Error("Failed to generate recommendations")
  }
}

/**
 * Check document completeness for visa application
 */
export async function checkDocumentCompleteness(applicationId: number): Promise<{
  missingDocuments: string[]
  incompleteDocuments: string[]
  completenessScore: number
  recommendations: string[]
}> {
  try {
    const userId = await requireUserId()
    
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))

    const uploadedTypes = userDocuments.map(doc => doc.type)
    
    const completenessPrompt = `You are an expert in Canadian student visa requirements. Check if the following documents are complete for a student visa application:

UPLOADED DOCUMENTS:
${uploadedTypes.map(type => `- ${type}`).join('\n')}

REQUIRED DOCUMENTS FOR CANADIAN STUDENT VISA:
1. Letter of Acceptance (LOA)
2. Proof of Financial Support
3. Passport
4. Academic Transcripts
5. English Language Proficiency (IELTS/TOEFL)
6. Statement of Purpose
7. Resume/CV
8. Medical Examination (if required)
9. Police Certificate (if required)
10. Photographs

Please analyze and provide:
1. Missing required documents
2. Documents that may be incomplete
3. Overall completeness score (0-100)
4. Specific recommendations

Format your response as JSON:
{
  "missingDocuments": ["doc1", "doc2"],
  "incompleteDocuments": ["doc1", "doc2"],
  "completenessScore": number,
  "recommendations": ["rec1", "rec2"]
}`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: completenessPrompt
        }
      ]
    })

    const completeness = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')
    
    return {
      missingDocuments: completeness.missingDocuments || [],
      incompleteDocuments: completeness.incompleteDocuments || [],
      completenessScore: completeness.completenessScore || 0,
      recommendations: completeness.recommendations || []
    }
  } catch (error) {
    console.error("Error checking document completeness:", error)
    throw new Error("Failed to check document completeness")
  }
}

/**
 * Test Claude AI connection
 */
export async function testClaudeConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { success: false, message: "ANTHROPIC_API_KEY not configured" }
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with 'Claude AI is working correctly' if you can read this message."
        }
      ]
    })

    return { 
      success: true, 
      message: response.content[0].type === 'text' ? response.content[0].text : 'No response text' 
    }
  } catch (error) {
    console.error("Claude AI connection test failed:", error)
    return { 
      success: false, 
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
} 