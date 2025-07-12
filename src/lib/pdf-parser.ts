// Wrapper for pdf-parse to prevent test mode from running
let pdfParse: any = null

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!pdfParse) {
    // Dynamically import pdf-parse only when needed
    const pdfParseModule = await import('pdf-parse')
    pdfParse = pdfParseModule.default || pdfParseModule
  }
  
  try {
    const data = await pdfParse(buffer)
    return data.text || ""
  } catch (error) {
    console.error("PDF parsing failed:", error)
    return ""
  }
} 