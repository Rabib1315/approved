"use server"

import { db } from "@/db"
import { documents } from "@/db/schema/documents-schema"
import { requireUserId } from "./auth-actions"
import { eq, desc, and } from "drizzle-orm"
import { createClient } from "@supabase/supabase-js"
import { extractTextFromPDF } from "@/lib/pdf-parser"
import mammoth from "mammoth"
import Tesseract from "tesseract.js"
import fs from "fs/promises"
import fsSync from "fs"
import path from "path"

// Set up PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Supabase environment variables are required")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png"
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadDocument(formData: FormData) {
  try {
    console.log("Starting document upload...")
    const userId = await requireUserId()
    const file = formData.get("file") as File
    const documentType = formData.get("type") as string
    const applicationId = formData.get("applicationId") as string
    
    console.log("Upload details:", { userId, documentType, fileName: file?.name, fileSize: file?.size, fileType: file?.type })
    
    if (!file || !documentType) {
      throw new Error("File and document type are required")
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF, JPG, and PNG files are allowed")
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size too large. Maximum size is 10MB")
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `${userId}/${documentType}/${timestamp}.${fileExtension}`
    
    console.log("Uploading to Supabase storage:", filename)
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false
      })
    
    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw new Error(`Supabase upload error: ${uploadError.message || uploadError.name || JSON.stringify(uploadError)}`)
    }

    console.log("File uploaded successfully, downloading for processing...")

    // Download the file back from Supabase for processing
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filename)
    if (downloadError || !downloadData) {
      console.error("Supabase download error:", downloadError)
      throw new Error("Failed to download file for processing")
    }

    console.log("File downloaded, extracting text...")

    // Save to a temp file for processing
    const tempDir = path.join("/tmp", userId)
    await fs.mkdir(tempDir, { recursive: true })
    const tempFilePath = path.join(tempDir, `${timestamp}.${fileExtension}`)
    const arrayBuffer = await downloadData.arrayBuffer()
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer))

    // Extract text based on file type
    let extractedText = ""
    try {
      if (fsSync.existsSync(tempFilePath)) {
        console.log("Extracting text from file type:", file.type)
        if (file.type === "application/pdf") {
          // Use the wrapper to extract text from PDF
          const fileBuffer = await fs.readFile(tempFilePath)
          extractedText = await extractTextFromPDF(fileBuffer)
          console.log("PDF text extraction completed, length:", extractedText.length)
        } else if (file.type === "image/jpeg" || file.type === "image/png") {
          const { data: { text } } = await Tesseract.recognize(tempFilePath, "eng")
          extractedText = text || ""
          console.log("Image OCR completed, length:", extractedText.length)
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const { value } = await mammoth.extractRawText({ path: tempFilePath })
          extractedText = value || ""
          console.log("DOCX text extraction completed, length:", extractedText.length)
        }
      } else {
        console.warn(`File does not exist for extraction: ${tempFilePath}`)
        extractedText = ""
      }
    } catch (extractionError) {
      console.error("Text extraction failed:", extractionError)
      extractedText = ""
    }

    // Clean up temp file
    await fs.unlink(tempFilePath)

    console.log("Saving document to database...")

    // Save document metadata and extracted text to database
    const [document] = await db
      .insert(documents)
      .values({
        user_id: userId,
        application_id: applicationId ? parseInt(applicationId) : null,
        type: documentType,
        filename: filename,
        original_name: file.name,
        size: file.size,
        mime_type: file.type,
        storage_path: uploadData.path,
        text_content: extractedText
      })
      .returning()
    
    console.log("Document uploaded successfully:", document.id)
    return document
  } catch (error) {
    console.error("=== DETAILED ERROR INFORMATION ===")
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    console.error("Error message:", (error as any)?.message)
    console.error("Error stack:", (error as any)?.stack)
    console.error("Full error object:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Failed to upload file to storage")) {
        throw new Error("Failed to upload file to storage - check your Supabase configuration")
      } else if (error.message.includes("Failed to download file for processing")) {
        throw new Error("Failed to download file for processing - storage issue")
      } else if (error.message.includes("Text extraction failed")) {
        throw new Error("Failed to extract text from document - file may be corrupted or unsupported")
      } else {
        throw new Error(`Upload failed: ${error.message}`)
      }
    }
    
    throw new Error("Failed to upload document - unknown error")
  }
}

export async function getDocuments(applicationId?: number) {
  try {
    const userId = await requireUserId()
    
    if (applicationId) {
      const userDocuments = await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.user_id, userId),
          eq(documents.application_id, applicationId)
        ))
        .orderBy(desc(documents.created_at))
      
      return userDocuments
    } else {
      const userDocuments = await db
        .select()
        .from(documents)
        .where(eq(documents.user_id, userId))
        .orderBy(desc(documents.created_at))
      
      return userDocuments
    }
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Failed to fetch documents")
  }
}

export async function getDocument(id: number) {
  try {
    const userId = await requireUserId()
    const document = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.user_id, userId)))
      .limit(1)
    
    if (document.length === 0) {
      throw new Error("Document not found")
    }
    
    return document[0]
  } catch (error) {
    console.error("Error fetching document:", error)
    throw new Error("Failed to fetch document")
  }
}

export async function deleteDocument(id: number) {
  try {
    const userId = await requireUserId()
    
    // Get document info first
    const document = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.user_id, userId)))
      .limit(1)
    
    if (document.length === 0) {
      throw new Error("Document not found")
    }
    
    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([document[0].storage_path])
    
    if (storageError) {
      console.error("Error deleting from storage:", storageError)
      // Continue with database deletion even if storage deletion fails
    }
    
    // Delete from database
    const [deletedDocument] = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.user_id, userId)))
      .returning()
    
    return deletedDocument
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

export async function getDocumentUrl(id: number): Promise<string> {
  try {
    const userId = await requireUserId()
    const document = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.user_id, userId)))
      .limit(1)
    
    if (document.length === 0) {
      throw new Error("Document not found")
    }
    
    // Generate signed URL for secure access
    const { data: urlData, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(document[0].storage_path, 3600) // 1 hour expiry
    
    if (urlError || !urlData?.signedUrl) {
      throw new Error("Failed to generate document URL")
    }
    
    return urlData.signedUrl
  } catch (error) {
    console.error("Error getting document URL:", error)
    throw new Error("Failed to get document URL")
  }
} 