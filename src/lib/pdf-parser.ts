import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    console.log('Starting Claude PDF text extraction, buffer size:', buffer.length)
    
    // Convert buffer to base64 for Claude
    const base64PDF = buffer.toString('base64')
    
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text content from this PDF document. Return only the raw text content without any formatting or explanations."
            },
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64PDF
              }
            }
          ]
        }
      ]
    })

    const extractedText = response.content[0]?.type === 'text' ? response.content[0].text : ''
    
    console.log('Claude extraction completed, text length:', extractedText.length)
    console.log('First 200 chars:', extractedText.substring(0, 200))
    
    return extractedText.trim()
  } catch (error) {
    console.error('Claude PDF extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 