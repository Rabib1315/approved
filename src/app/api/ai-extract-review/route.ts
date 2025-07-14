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
    console.log("AI Extract Review API called")
    const { userId } = await auth()
    console.log("User ID:", userId)
    
    if (!userId) {
      console.log("No user ID found - unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's uploaded documents
    console.log("Fetching documents for user:", userId)
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))

    console.log("Found documents:", userDocuments.length)
    if (userDocuments.length === 0) {
      return NextResponse.json({ error: "No documents found" }, { status: 404 })
    }

    // Aggregate all extracted text
    const allText = userDocuments.map(doc => doc.text_content || "").join("\n\n")
    console.log("Aggregated text length:", allText.length)
    console.log("Text preview:", allText.substring(0, 200))

    // Prompt for Claude to extract structured info
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

Return ONLY a valid JSON object with this exact structure. Do not include any explanation or additional text:

{
  "school": { "value": "", "confidence": 0 },
  "program": { "value": "", "confidence": 0 },
  "duration": { "value": "", "confidence": 0 },
  "startDate": { "value": "", "confidence": 0 },
  "annualTuition": { "value": 0, "confidence": 0 },
  "city": { "value": "", "confidence": 0 },
  "fullName": { "value": "", "confidence": 0 },
  "nationality": { "value": "", "confidence": 0 },
  "passportExpiry": { "value": "", "confidence": 0 },
  "averageBalance": { "value": 0, "confidence": 0 },
  "monthlyIncome": { "value": 0, "confidence": 0 }
}

Fill in the actual values and confidence scores based on the text below. If a field is missing, leave value as empty string or 0 and confidence as 0.

Text to analyze:
"""
${allText}
"""`

    console.log("Calling Claude API...")
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
    console.log("Claude response:", aiResponse.substring(0, 500))
    
    let extracted
    try {
      // Try to extract JSON from the response in case there's extra text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      
      extracted = JSON.parse(jsonString)
      console.log("Parsed extraction result:", extracted)
    } catch (error) {
      console.error("JSON parse error:", error)
      console.log("Raw response:", aiResponse)
      
      // Return default structure if parsing fails
      extracted = {
        school: { value: "", confidence: 0 },
        program: { value: "", confidence: 0 },
        duration: { value: "", confidence: 0 },
        startDate: { value: "", confidence: 0 },
        annualTuition: { value: 0, confidence: 0 },
        city: { value: "", confidence: 0 },
        fullName: { value: "", confidence: 0 },
        nationality: { value: "", confidence: 0 },
        passportExpiry: { value: "", confidence: 0 },
        averageBalance: { value: 0, confidence: 0 },
        monthlyIncome: { value: 0, confidence: 0 }
      }
    }

    return NextResponse.json(extracted)
  } catch (error) {
    console.error("AI Extract Review error:", error)
    return NextResponse.json(
      { error: "Failed to extract review data" },
      { status: 500 }
    )
  }
} 