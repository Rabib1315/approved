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

    // Aggregate all extracted text
    const allText = userDocuments.map(doc => doc.text_content || "").join("\n\n")

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
      extracted = {}
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