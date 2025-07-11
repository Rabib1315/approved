"use server"

import { db } from "@/db"
import { applications } from "@/db/schema/applications-schema"
import { requireUserId } from "./auth-actions"
import { eq, desc, and } from "drizzle-orm"
import { InsertApplication } from "@/db/schema/applications-schema"

export async function getApplications() {
  try {
    const userId = await requireUserId()
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.user_id, userId))
      .orderBy(desc(applications.created_at))
    return userApplications
  } catch (error) {
    console.error("Error fetching applications:", error)
    throw new Error("Failed to fetch applications")
  }
}

export async function getApplication(id: number) {
  try {
    const userId = await requireUserId()
    const application = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
      .limit(1)
    
    if (application.length === 0) {
      throw new Error("Application not found")
    }
    
    return application[0]
  } catch (error) {
    console.error("Error fetching application:", error)
    throw new Error("Failed to fetch application")
  }
}

export async function createApplication(data: Omit<InsertApplication, "user_id" | "created_at" | "updated_at">) {
  try {
    const userId = await requireUserId()
    const [application] = await db
      .insert(applications)
      .values({
        ...data,
        user_id: userId
      })
      .returning()
    
    return application
  } catch (error) {
    console.error("Error creating application:", error)
    throw new Error("Failed to create application")
  }
}

export async function updateApplication(id: number, data: Partial<Omit<InsertApplication, "user_id" | "created_at" | "updated_at">>) {
  try {
    const userId = await requireUserId()
    const [application] = await db
      .update(applications)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
      .returning()
    
    if (!application) {
      throw new Error("Application not found")
    }
    
    return application
  } catch (error) {
    console.error("Error updating application:", error)
    throw new Error("Failed to update application")
  }
}

export async function deleteApplication(id: number) {
  try {
    const userId = await requireUserId()
    const [application] = await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
      .returning()
    
    if (!application) {
      throw new Error("Application not found")
    }
    
    return application
  } catch (error) {
    console.error("Error deleting application:", error)
    throw new Error("Failed to delete application")
  }
}

export async function getApplicationStrength(id: number): Promise<number> {
  try {
    const userId = await requireUserId()
    const application = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
      .limit(1)
    
    if (application.length === 0) {
      throw new Error("Application not found")
    }
    
    // Calculate strength score based on application completeness
    let score = 0
    const app = application[0]
    
    // Basic information (40 points)
    if (app.institution) score += 10
    if (app.program) score += 10
    if (app.start_date) score += 10
    if (app.total_cost) score += 10
    
    // Status and completion (30 points)
    if (app.status === "complete") score += 30
    else if (app.status === "in_review") score += 20
    else if (app.status === "draft") score += 10
    
    // Additional factors (30 points)
    if (app.is_complete) score += 30
    
    // Update the strength score in database
    await db
      .update(applications)
      .set({ strength_score: score })
      .where(eq(applications.id, id))
    
    return score
  } catch (error) {
    console.error("Error calculating application strength:", error)
    throw new Error("Failed to calculate application strength")
  }
} 