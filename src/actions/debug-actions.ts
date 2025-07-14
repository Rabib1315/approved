"use server"

import { db } from "@/db"
import { documents } from "@/db/schema/documents-schema"
import { requireUserId } from "./auth-actions"
import { eq } from "drizzle-orm"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function debugDocuments() {
  try {
    const userId = await requireUserId()
    
    // Get all user documents
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))
    
    console.log("=== DEBUG: User Documents ===")
    console.log(`Found ${userDocuments.length} documents for user ${userId}`)
    
    userDocuments.forEach((doc, index) => {
      console.log(`\n--- Document ${index + 1} ---`)
      console.log(`ID: ${doc.id}`)
      console.log(`Type: ${doc.type}`)
      console.log(`Filename: ${doc.filename}`)
      console.log(`Original Name: ${doc.original_name}`)
      console.log(`Size: ${doc.size}`)
      console.log(`MIME Type: ${doc.mime_type}`)
      console.log(`Storage Path: ${doc.storage_path}`)
      console.log(`Text Content Length: ${doc.text_content?.length || 0}`)
      console.log(`Text Content Preview: ${doc.text_content?.substring(0, 200) || "No text content"}...`)
      console.log(`Created: ${doc.created_at}`)
    })
    
    // Aggregate all text content
    const allText = userDocuments.map(doc => doc.text_content || "").join("\n\n")
    console.log(`\n=== AGGREGATED TEXT ===`)
    console.log(`Total text length: ${allText.length}`)
    console.log(`Text preview: ${allText.substring(0, 500)}...`)
    
    return {
      success: true,
      documentCount: userDocuments.length,
      documents: userDocuments.map(doc => ({
        id: doc.id,
        type: doc.type,
        filename: doc.filename,
        originalName: doc.original_name,
        size: doc.size,
        mimeType: doc.mime_type,
        textLength: doc.text_content?.length || 0,
        textPreview: doc.text_content?.substring(0, 200) || "No text content",
        created: doc.created_at
      })),
      totalTextLength: allText.length,
      textPreview: allText.substring(0, 500)
    }
  } catch (error) {
    console.error("Error debugging documents:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function testAIExtraction() {
  try {
    const userId = await requireUserId()
    
    // Get user documents
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))
    
    if (userDocuments.length === 0) {
      return { success: false, message: "No documents found" }
    }
    
    // Aggregate all text
    const allText = userDocuments.map(doc => doc.text_content || "").join("\n\n")
    
    console.log("=== TESTING AI EXTRACTION ===")
    console.log(`Text to send to AI: ${allText.substring(0, 500)}...`)
    
    if (allText.trim().length === 0) {
      return { 
        success: false, 
        message: "No text content found in documents. PDF extraction may have failed." 
      }
    }
    
    // Call Claude AI directly instead of making HTTP request
    const extractionPrompt = `You are an expert Canadian student visa application assistant. Extract the following information from the provided text (from uploaded documents):

- School name
- Program name
- Program duration
- Program start date
- Annual tuition (CAD)
- City
- Full name
- Nationality
- Passport expiry date
- Average bank balance (CAD)
- Monthly income (CAD)

For each field, provide:
- value (string or number)
- confidence (0-100, how certain you are about the value)

Return a JSON object with this structure:
{
  "school": { "value": string, "confidence": number },
  "program": { "value": string, "confidence": number },
  "duration": { "value": string, "confidence": number },
  "startDate": { "value": string, "confidence": number },
  "annualTuition": { "value": number, "confidence": number },
  "city": { "value": string, "confidence": number },
  "fullName": { "value": string, "confidence": number },
  "nationality": { "value": string, "confidence": number },
  "passportExpiry": { "value": string, "confidence": number },
  "averageBalance": { "value": number, "confidence": number },
  "monthlyIncome": { "value": number, "confidence": number }
}

If a field is missing, leave value as an empty string or 0 and confidence as 0. Here is the text:

"""
${allText}
"""`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: extractionPrompt
        }
      ]
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '{}'
    let extracted
    try {
      extracted = JSON.parse(aiResponse)
    } catch (error) {
      console.error("Failed to parse AI response:", aiResponse)
      extracted = { error: "Failed to parse AI response", rawResponse: aiResponse }
    }
    
    console.log("AI extraction result:", extracted)
    
    return {
      success: true,
      documentCount: userDocuments.length,
      textLength: allText.length,
      aiResult: extracted
    }
  } catch (error) {
    console.error("Error testing AI extraction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
} 