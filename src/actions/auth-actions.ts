"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users } from "@/db/schema/users-schema"
import { eq } from "drizzle-orm"

export async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Authentication required")
  return userId
}

export async function getCurrentUser() {
  try {
    const userId = await requireUserId()
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) throw new Error("User not found")
    
    // Get user from database
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, clerkUserId))
      .limit(1)
    
    if (userRecord.length === 0) {
      throw new Error("User not found in database")
    }
    
    return userRecord[0]
  } catch (error) {
    console.error("Error getting current user:", error)
    throw new Error("Failed to get current user")
  }
}

export async function createOrUpdateUser(userData: {
  id: string
  email: string
  firstName?: string
  lastName?: string
}) {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userData.id))
      .limit(1)

    if (existingUser.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          updated_at: new Date()
        })
        .where(eq(users.id, userData.id))
    } else {
      // Create new user
      await db.insert(users).values({
        id: userData.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName
      })
    }
  } catch (error) {
    console.error("Error creating/updating user:", error)
    throw new Error("Failed to create/update user")
  }
} 