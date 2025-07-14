"use server"

import { db } from "@/db"
import { documents } from "@/db/schema/documents-schema"
import { requireUserId } from "./auth-actions"
import { eq } from "drizzle-orm"
import { createClient } from "@supabase/supabase-js"
import { extractTextFromPDF } from "@/lib/pdf-parser"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function debugPDFExtraction() {
  try {
    const userId = await requireUserId()
    
    // Get the most recent document
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.user_id, userId))
      .orderBy(documents.created_at)
      .limit(1)
    
    if (userDocuments.length === 0) {
      return { success: false, message: "No documents found" }
    }
    
    const document = userDocuments[0]
    console.log("=== PDF EXTRACTION DEBUG ===")
    console.log("Document:", document.filename)
    console.log("Storage path:", document.storage_path)
    console.log("MIME type:", document.mime_type)
    console.log("Current text content length:", document.text_content?.length || 0)
    
    // Download the file from Supabase
    console.log("Downloading file from Supabase...")
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.storage_path)
    
    if (downloadError) {
      console.error("Download error:", downloadError)
      return { success: false, message: `Download failed: ${downloadError.message}` }
    }
    
    console.log("File downloaded successfully, size:", downloadData.size)
    
    // Convert to buffer and try extraction
    const arrayBuffer = await downloadData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log("Buffer size:", buffer.length)
    console.log("Buffer preview:", buffer.slice(0, 20).toString())
    
    // Try PDF extraction
    console.log("Attempting PDF text extraction...")
    const extractedText = await extractTextFromPDF(buffer)
    
    console.log("Extraction completed!")
    console.log("Extracted text length:", extractedText.length)
    console.log("Text preview:", extractedText.substring(0, 500))
    
    // Update the document with extracted text
    if (extractedText.length > 0) {
      await db
        .update(documents)
        .set({ text_content: extractedText })
        .where(eq(documents.id, document.id))
      
      console.log("Updated document with extracted text")
    }
    
    return {
      success: true,
      documentId: document.id,
      filename: document.filename,
      originalTextLength: document.text_content?.length || 0,
      newTextLength: extractedText.length,
      textPreview: extractedText.substring(0, 500),
      message: extractedText.length > 0 ? "Text extraction successful!" : "No text found in PDF"
    }
    
  } catch (error) {
    console.error("PDF extraction debug error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
} 