"use server"

import { db } from "@/db"
import { applications } from "@/db/schema/applications-schema"
import { documents } from "@/db/schema/documents-schema"
import { users } from "@/db/schema/users-schema"
import { requireUserId } from "./auth-actions"
import { eq, desc, and, count } from "drizzle-orm"
import { InsertApplication } from "@/db/schema/applications-schema"

// AI Scoring Factors and Weights
const SCORING_WEIGHTS = {
  INSTITUTION_QUALITY: 0.25,    // 25% - University ranking, reputation
  FINANCIAL_FIT: 0.20,          // 20% - Cost vs. financial capacity
  USER_PROFILE: 0.20,           // 20% - Academic background, experience
  PROGRAM_FIT: 0.15,            // 15% - Program alignment with goals
  DOCUMENT_COMPLETENESS: 0.20   // 20% - Required documents uploaded
}

// Institution Quality Scoring (based on common university rankings)
const INSTITUTION_SCORES = {
  "University of Toronto": 95,
  "University of British Columbia": 92,
  "McGill University": 90,
  "University of Waterloo": 88,
  "University of Alberta": 85,
  "University of Montreal": 83,
  "University of Calgary": 80,
  "University of Ottawa": 78,
  "Queen's University": 75,
  "Western University": 72,
  // Add more institutions as needed
}

// Financial Risk Assessment
const FINANCIAL_RISK_FACTORS = {
  LOW_RISK_COUNTRIES: ["USA", "UK", "Australia", "Germany", "France", "Japan", "South Korea"],
  MEDIUM_RISK_COUNTRIES: ["India", "China", "Brazil", "Mexico", "Turkey", "Thailand"],
  HIGH_RISK_COUNTRIES: ["Nigeria", "Pakistan", "Bangladesh", "Ghana", "Kenya"]
}

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

// AI-Driven Application Strength Scoring
export async function calculateApplicationStrength(id: number): Promise<{
  totalScore: number
  breakdown: {
    institutionQuality: number
    financialFit: number
    userProfile: number
    programFit: number
    documentCompleteness: number
  }
  recommendations: string[]
}> {
  try {
    const userId = await requireUserId()
    
    // Get application data
    const application = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.user_id, userId)))
      .limit(1)
    
    if (application.length === 0) {
      throw new Error("Application not found")
    }
    
    const app = application[0]
    
    // Get user profile
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    if (user.length === 0) {
      throw new Error("User not found")
    }
    
    const userProfile = user[0]
    
    // Get document count
    const documentCount = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.application_id, id))
    
    const docCount = documentCount[0]?.count || 0
    
    // Calculate individual scores
    const scores = {
      institutionQuality: calculateInstitutionQuality(app.institution),
      financialFit: calculateFinancialFit(app.total_cost, userProfile.country_of_origin || undefined),
      userProfile: calculateUserProfileScore(userProfile),
      programFit: calculateProgramFit(app.program, app.institution),
      documentCompleteness: calculateDocumentCompleteness(docCount)
    }
    
    // Calculate weighted total score
    const totalScore = Math.round(
      scores.institutionQuality * SCORING_WEIGHTS.INSTITUTION_QUALITY +
      scores.financialFit * SCORING_WEIGHTS.FINANCIAL_FIT +
      scores.userProfile * SCORING_WEIGHTS.USER_PROFILE +
      scores.programFit * SCORING_WEIGHTS.PROGRAM_FIT +
      scores.documentCompleteness * SCORING_WEIGHTS.DOCUMENT_COMPLETENESS
    )
    
    // Generate recommendations
    const recommendations = generateRecommendations(scores, app, userProfile, docCount)
    
    // Update the strength score in database
    await db
      .update(applications)
      .set({ strength_score: totalScore })
      .where(eq(applications.id, id))
    
    return {
      totalScore,
      breakdown: scores,
      recommendations
    }
  } catch (error) {
    console.error("Error calculating application strength:", error)
    throw new Error("Failed to calculate application strength")
  }
}

// Helper functions for AI scoring
function calculateInstitutionQuality(institution: string): number {
  const normalizedInstitution = institution.toLowerCase().trim()
  
  // Check against known institutions
  for (const [name, score] of Object.entries(INSTITUTION_SCORES)) {
    if (normalizedInstitution.includes(name.toLowerCase())) {
      return score
    }
  }
  
  // Default scoring based on institution type
  if (normalizedInstitution.includes("university")) {
    return 70 // Good baseline for universities
  } else if (normalizedInstitution.includes("college")) {
    return 60 // Colleges typically score lower
  } else {
    return 50 // Unknown institutions get baseline score
  }
}

function calculateFinancialFit(totalCost: string, countryOfOrigin?: string): number {
  const cost = parseFloat(totalCost.replace(/[^0-9.]/g, "")) || 0
  
  // Base financial score (lower cost = higher score)
  let baseScore = Math.max(0, 100 - (cost / 1000)) // $1000 = 10 point reduction
  
  // Adjust based on country of origin risk
  if (countryOfOrigin) {
    const country = countryOfOrigin.toLowerCase()
    
    if (FINANCIAL_RISK_FACTORS.LOW_RISK_COUNTRIES.some(c => country.includes(c.toLowerCase()))) {
      baseScore += 10 // Bonus for low-risk countries
    } else if (FINANCIAL_RISK_FACTORS.HIGH_RISK_COUNTRIES.some(c => country.includes(c.toLowerCase()))) {
      baseScore -= 15 // Penalty for high-risk countries
    }
  }
  
  return Math.max(0, Math.min(100, baseScore))
}

function calculateUserProfileScore(userProfile: any): number {
  let score = 50 // Base score
  
  // Bonus for complete profile
  if (userProfile.country_of_origin && userProfile.current_country && userProfile.phone) {
    score += 20
  }
  
  // Bonus for being onboarded
  if (userProfile.is_onboarded) {
    score += 15
  }
  
  // Country-specific bonuses
  if (userProfile.country_of_origin) {
    const country = userProfile.country_of_origin.toLowerCase()
    
    // Bonus for English-speaking countries
    if (["usa", "uk", "canada", "australia", "new zealand"].some(c => country.includes(c))) {
      score += 10
    }
    
    // Bonus for developed countries
    if (FINANCIAL_RISK_FACTORS.LOW_RISK_COUNTRIES.some(c => country.includes(c.toLowerCase()))) {
      score += 5
    }
  }
  
  return Math.min(100, score)
}

function calculateProgramFit(program: string, institution: string): number {
  let score = 70 // Base score
  
  // Program type scoring
  const programLower = program.toLowerCase()
  
  if (programLower.includes("computer") || programLower.includes("software") || programLower.includes("data")) {
    score += 15 // High-demand programs
  } else if (programLower.includes("business") || programLower.includes("management")) {
    score += 10 // Good demand
  } else if (programLower.includes("engineering")) {
    score += 12 // High-demand
  } else if (programLower.includes("arts") || programLower.includes("humanities")) {
    score += 5 // Lower demand
  }
  
  // Institution-program alignment
  const institutionLower = institution.toLowerCase()
  if (institutionLower.includes("waterloo") && programLower.includes("computer")) {
    score += 10 // Waterloo is known for CS
  } else if (institutionLower.includes("toronto") && (programLower.includes("business") || programLower.includes("medicine"))) {
    score += 8 // UofT is strong in business/medicine
  }
  
  return Math.min(100, score)
}

function calculateDocumentCompleteness(docCount: number): number {
  // Required documents for a complete application
  const requiredDocs = 8 // passport, transcripts, letters, financial docs, etc.
  
  const completeness = (docCount / requiredDocs) * 100
  return Math.min(100, completeness)
}

function generateRecommendations(scores: any, application: any, userProfile: any, docCount: number): string[] {
  const recommendations: string[] = []
  
  // Institution recommendations
  if (scores.institutionQuality < 70) {
    recommendations.push("Consider applying to higher-ranked institutions to improve your application strength")
  }
  
  // Financial recommendations
  if (scores.financialFit < 60) {
    recommendations.push("Strengthen your financial documentation and consider more affordable programs")
  }
  
  // Document recommendations
  if (scores.documentCompleteness < 80) {
    const missingDocs = 8 - docCount
    recommendations.push(`Upload ${missingDocs} more required documents to complete your application`)
  }
  
  // Program recommendations
  if (scores.programFit < 70) {
    recommendations.push("Consider programs with higher demand in the Canadian job market")
  }
  
  // User profile recommendations
  if (scores.userProfile < 70) {
    recommendations.push("Complete your profile information to improve your application assessment")
  }
  
  // Overall recommendations
  if (scores.totalScore < 60) {
    recommendations.push("Your application needs significant improvements. Consider working with an immigration consultant")
  } else if (scores.totalScore < 80) {
    recommendations.push("Your application is good but could be strengthened with additional documents and preparation")
  } else {
    recommendations.push("Excellent application strength! You have a high chance of approval")
  }
  
  return recommendations
} 