import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const chatPrompt = `You are an expert Canadian student visa consultant with years of experience helping international students. You provide accurate, helpful, and encouraging advice about Canadian student visa applications.

Your expertise includes:
- Document requirements and preparation
- Application timelines and processes
- Financial requirements and proof of funds
- Common rejection reasons and how to avoid them
- Tips for strengthening applications
- Post-arrival guidance
- Study permit conditions and compliance

Current user question: "${message}"

Please provide a comprehensive, helpful response that:
1. Directly addresses their question
2. Provides specific, actionable advice
3. Is encouraging and supportive
4. Includes relevant examples when helpful
5. Mentions important deadlines or requirements if relevant
6. Suggests next steps when appropriate

Keep your response conversational, informative, and under 300 words unless more detail is specifically requested.`

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: chatPrompt
        }
      ]
    })

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I encountered an issue processing your request. Please try asking your question again.'

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("AI Chat error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
} 