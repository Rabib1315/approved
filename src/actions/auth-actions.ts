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

export async function updateUserProfile(profileData: {
  country_of_origin?: string
  current_country?: string
  phone?: string
}) {
  try {
    const userId = await requireUserId()
    
    await db
      .update(users)
      .set({
        ...profileData,
        updated_at: new Date()
      })
      .where(eq(users.id, userId))
    
    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

export async function completeOnboarding() {
  try {
    const userId = await requireUserId()
    
    await db
      .update(users)
      .set({
        is_onboarded: true,
        updated_at: new Date()
      })
      .where(eq(users.id, userId))
    
    return { success: true }
  } catch (error) {
    console.error("Error completing onboarding:", error)
    throw new Error("Failed to complete onboarding")
  }
}

export async function getUserOnboardingStatus() {
  try {
    const userId = await requireUserId()
    
    const user = await db
      .select({
        is_onboarded: users.is_onboarded,
        country_of_origin: users.country_of_origin,
        current_country: users.current_country,
        phone: users.phone
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    if (user.length === 0) {
      return { is_onboarded: false, profile_complete: false }
    }
    
    const profile = user[0]
    const profile_complete = !!(profile.country_of_origin && profile.current_country && profile.phone)
    
    return {
      is_onboarded: profile.is_onboarded,
      profile_complete
    }
  } catch (error) {
    console.error("Error getting onboarding status:", error)
    throw new Error("Failed to get onboarding status")
  }
} 