"use server"

import { requireUserId } from "./auth-actions"
import { db } from "@/db"
import { applications } from "@/db/schema/applications-schema"
import { documents } from "@/db/schema/documents-schema"
import { users } from "@/db/schema/users-schema"
import { eq } from "drizzle-orm"

export async function createTestData() {
  try {
    const userId = await requireUserId()
    
    // Check if user exists, if not create one
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    if (!existingUser.length) {
      await db.insert(users).values({
        id: userId,
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        country_of_origin: "India",
        current_country: "Canada",
        phone: "+1-555-0123",
        is_onboarded: true
      })
    }
    
    // Create a test application
    const testApplication = await db.insert(applications).values({
      user_id: userId,
      institution: "University of Toronto",
      program: "Master of Computer Science",
      start_date: "2024-09-01",
      total_cost: "45000",
      status: "draft"
    }).returning()
    
    // Create some test documents with valid Supabase storage paths
    await db.insert(documents).values({
      user_id: userId,
      type: "Letter of Acceptance",
      filename: "loa_toronto.pdf",
      original_name: "loa_toronto.pdf",
      size: 1024000,
      mime_type: "application/pdf",
      storage_path: `${userId}/Letter of Acceptance/${Date.now()}.pdf`,
      text_content: "This is a sample letter of acceptance from University of Toronto for Master of Computer Science program starting September 2024."
    })
    
    await db.insert(documents).values({
      user_id: userId,
      type: "Academic Transcripts",
      filename: "transcripts.pdf",
      original_name: "transcripts.pdf",
      size: 2048000,
      mime_type: "application/pdf",
      storage_path: `${userId}/Academic Transcripts/${Date.now()}.pdf`,
      text_content: "Sample academic transcripts showing excellent grades in Computer Science courses with GPA 3.8/4.0."
    })
    
    await db.insert(documents).values({
      user_id: userId,
      type: "IELTS Score",
      filename: "ielts_score.pdf",
      original_name: "ielts_score.pdf",
      size: 512000,
      mime_type: "application/pdf",
      storage_path: `${userId}/IELTS Score/${Date.now()}.pdf`,
      text_content: "IELTS test results: Overall Band Score 7.5, Reading 8.0, Writing 7.0, Listening 7.5, Speaking 7.0."
    })
    
    return { 
      success: true, 
      applicationId: testApplication[0].id as number,
      message: "Test data created successfully" 
    }
  } catch (error) {
    console.error("Error creating test data:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function getTestApplicationId(): Promise<number | null> {
  try {
    const userId = await requireUserId()
    
    const application = await db
      .select()
      .from(applications)
      .where(eq(applications.user_id, userId))
      .limit(1)
    
    if (application.length > 0) {
      return application[0].id
    }
    
    return null
  } catch (error) {
    console.error("Error getting test application:", error)
    return null
  }
} 