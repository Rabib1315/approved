import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@clerk/nextjs/server"
import { getApplication } from "@/actions/visa-actions"
import { db } from "@/db"
import { users } from "@/db/schema/users-schema"
import { eq } from "drizzle-orm"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, type } = body
    let program = body.program
    let institution = body.institution
    let country = body.country
    let background = body.background
    let goals = body.goals

    // If applicationId is provided, fetch application and user profile
    if (applicationId) {
      try {
        const app = await getApplication(Number(applicationId))
        program = app.program
        institution = app.institution
        // Fetch user profile fields
        const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1)
        const userProfile = userRows[0] || {}
        country = userProfile.country_of_origin || ""
        background = ""
        goals = ""
      } catch (e) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
    }

    if (!program || !institution) {
      return NextResponse.json({ error: "Program and institution are required" }, { status: 400 })
    }

    // Build prompt based on type
    let templatePrompt = ""
    if (type === "studyPlan") {
      templatePrompt = `You are an expert Canadian student visa consultant. Write a compelling, personalized Study Plan Letter for a student applying to study in Canada.\n\nStudent Profile:\n- Program: ${program}\n- Institution: ${institution}\n- Country of Origin: ${country || "Not specified"}\n- Background: ${background || "Not specified"}\n- Career Goals: ${goals || "Not specified"}\n\nThe letter should be 2-3 paragraphs, specific to their situation, and highlight their academic preparation, motivation, financial situation, and intent to return home. Respond with only the letter text.`
    } else if (type === "financialPlan") {
      templatePrompt = `You are an expert Canadian student visa consultant. Write a detailed Financial Plan Letter for a student applying to study in Canada.\n\nStudent Profile:\n- Program: ${program}\n- Institution: ${institution}\n- Country of Origin: ${country || "Not specified"}\n- Background: ${background || "Not specified"}\n- Career Goals: ${goals || "Not specified"}\n\nThe letter should clearly explain the student's funding sources, amounts, and ability to pay for tuition and living expenses. Respond with only the letter text.`
    } else {
      // Default: generate the full template as before
      templatePrompt = `You are an expert Canadian student visa consultant. Generate a comprehensive, personalized application template for a student applying to study in Canada.\n\nStudent Profile:\n- Program: ${program}\n- Institution: ${institution}\n- Country of Origin: ${country || "Not specified"}\n- Background: ${background || "Not specified"}\n- Career Goals: ${goals || "Not specified"}\n\nPlease generate the following components in JSON format:\n\n1. Statement of Purpose (2-3 paragraphs, compelling and specific to their situation)\n2. Resume Template (structured format with relevant sections)\n3. Cover Letter (if applicable for their program)\n4. Document Checklist (specific to their program and country)\n5. Application Tips (5-7 specific, actionable tips)\n\nFormat your response as a valid JSON object with these keys:\n- statementOfPurpose: string\n- resumeTemplate: string  \n- coverLetter: string\n- documentChecklist: string[]\n- tips: string[]\n\nMake the content specific to their program, institution, and background. Include relevant keywords and requirements for Canadian student visas.`
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: templatePrompt
        }
      ]
    })

    let template
    if (type === "studyPlan" || type === "financialPlan") {
      // For single letter, just return the text
      template = type === "studyPlan"
        ? { statementOfPurpose: response.content[0].type === 'text' ? response.content[0].text : '' }
        : { resumeTemplate: response.content[0].type === 'text' ? response.content[0].text : '' }
    } else {
      // Try to parse the JSON response
      const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '{}'
      try {
        template = JSON.parse(aiResponse)
      } catch (error) {
        // If parsing fails, create a fallback template
        template = {
          statementOfPurpose: `I am writing to express my strong interest in pursuing ${program} at ${institution}. With my background in ${background || "academic studies"}, I am excited about the opportunity to further my education in Canada and contribute to the academic community at ${institution}. My career goals include ${goals || "advancing my knowledge and skills in this field"}, and I believe this program will provide the perfect foundation for achieving these objectives.`,
          resumeTemplate: `EDUCATION\n[Your Degree] - [Your University]\n[Graduation Year]\n\nEXPERIENCE\n[Relevant Experience]\n\nSKILLS\n[Relevant Skills]\n\nPROJECTS\n[Academic/Professional Projects]`,
          coverLetter: `Dear Admissions Committee,\n\nI am writing to express my interest in the ${program} at ${institution}...`,
          documentChecklist: [
            "Valid passport",
            "Letter of acceptance from institution",
            "Proof of financial support",
            "Academic transcripts",
            "English language test results",
            "Statement of purpose",
            "Resume/CV",
            "Passport photos"
          ],
          tips: [
            "Start your application at least 6 months before your intended start date",
            "Ensure all documents are properly translated and notarized",
            "Demonstrate strong ties to your home country",
            "Provide clear evidence of financial capacity",
            "Write a compelling statement of purpose",
            "Submit a complete and organized application package"
          ]
        }
      }
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("AI Template error:", error)
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    )
  }
} 