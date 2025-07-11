"use server"

import { db } from "@/db"
import { documents } from "@/db/schema/documents-schema"
import { requireUserId } from "./auth-actions"
import { eq, desc, and } from "drizzle-orm"
import { createClient } from "@supabase/supabase-js"

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
    const userId = await requireUserId()
    const file = formData.get("file") as File
    const documentType = formData.get("type") as string
    const applicationId = formData.get("applicationId") as string
    
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
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false
      })
    
    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw new Error("Failed to upload file to storage")
    }
    
    // Save document metadata to database
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
        storage_path: uploadData.path
      })
      .returning()
    
    return document
  } catch (error) {
    console.error("Error uploading document:", error)
    throw new Error("Failed to upload document")
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