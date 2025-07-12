"use server"

import { calculateApplicationStrength } from "./visa-actions"
import { createApplication } from "./visa-actions"
import { updateUserProfile } from "./auth-actions"

// Test function to demonstrate AI scoring
export async function testAIScoring() {
  try {
    // 1. Update user profile with sample data
    await updateUserProfile({
      country_of_origin: "India",
      current_country: "Canada",
      phone: "+1234567890"
    })
    
    // 2. Create a sample application
    const application = await createApplication({
      institution: "University of Waterloo",
      program: "Computer Science",
      start_date: "2024-09-01",
      total_cost: "45000",
      status: "draft",
      is_complete: false
    })
    
    // 3. Calculate AI-driven strength score
    const strengthAnalysis = await calculateApplicationStrength(application.id)
    
    return {
      application,
      strengthAnalysis,
      message: "AI scoring test completed successfully!"
    }
  } catch (error) {
    console.error("Error in test scoring:", error)
    throw new Error("Failed to test AI scoring")
  }
} 