"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle, Edit3 } from "lucide-react"
import clsx from "clsx"

async function fetchAIExtractedData() {
  // Call backend API to analyze/parse the text (Claude)
  // The API route will fetch documents and process them
  const res = await fetch("/api/ai-extract-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch AI data: ${res.status} ${res.statusText}`)
  }
  
  return await res.json()
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = (conf: number) => {
    if (conf >= 95) return "bg-green-100 text-green-700"
    if (conf >= 85) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", getColor(confidence))}>
      {confidence}%
    </span>
  )
}

function DataRow({ label, value, confidence }: { label: string; value: string | number; confidence: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {typeof value === 'number' && value >= 1000 ? `CAD $${value.toLocaleString()}` : value}
        </span>
        <ConfidenceBadge confidence={confidence} />
      </div>
    </div>
  )
}

function FinancialCalculation({ 
  annualTuition, 
  duration, 
  monthlyCost, 
  availableFunds 
}: { 
  annualTuition: number
  duration: number
  monthlyCost: number
  availableFunds: number
}) {
  const totalTuition = annualTuition * duration
  const totalLiving = monthlyCost * (duration * 12)
  const totalRequired = totalTuition + totalLiving
  const financialGap = Math.max(0, totalRequired - availableFunds)

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Annual Tuition:</span>
          <span className="font-medium">CAD ${annualTuition.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Program Duration:</span>
          <span className="font-medium">{duration} years</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Tuition:</span>
          <span className="font-medium">CAD ${totalTuition.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Monthly Living Cost:</span>
          <span className="font-medium">CAD ${monthlyCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Living Costs:</span>
          <span className="font-medium">CAD ${totalLiving.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-900">TOTAL REQUIRED:</span>
            <span className="text-gray-900">CAD ${totalRequired.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Your Available Funds:</span>
          <span className="font-medium">CAD ${availableFunds.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className={financialGap > 0 ? "text-red-600" : "text-green-600"}>
              {financialGap > 0 ? "FINANCIAL GAP:" : "SUFFICIENT FUNDS:"}
            </span>
            <span className={financialGap > 0 ? "text-red-600" : "text-green-600"}>
              CAD ${financialGap.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const router = useRouter()
  const [aiData, setAIData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchAIExtractedData()
      .then(setAIData)
      .catch((e) => setError(e.message || "Failed to analyze documents"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Analyzing your documents...</div>
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>
  }
  if (!aiData) {
    return <div className="flex justify-center items-center min-h-screen">No data found.</div>
  }

  // Safe access to aiData properties with defaults
  const safeGet = (obj: any, key: string, defaultValue: any = "Not found") => {
    return obj && obj[key] && obj[key].value !== undefined ? obj[key].value : defaultValue
  }

  const safeGetConfidence = (obj: any, key: string, defaultValue: number = 0) => {
    return obj && obj[key] && obj[key].confidence !== undefined ? obj[key].confidence : defaultValue
  }

  // Extract values with safe defaults
  const school = safeGet(aiData, 'school', 'University not found')
  const program = safeGet(aiData, 'program', 'Program not found')
  const duration = safeGet(aiData, 'duration', 'Duration not found')
  const startDate = safeGet(aiData, 'startDate', 'Start date not found')
  const annualTuition = safeGet(aiData, 'annualTuition', 0)
  const city = safeGet(aiData, 'city', 'Toronto')
  const fullName = safeGet(aiData, 'fullName', 'Name not found')
  const nationality = safeGet(aiData, 'nationality', 'Nationality not found')
  const passportExpiry = safeGet(aiData, 'passportExpiry', 'Expiry not found')
  const averageBalance = safeGet(aiData, 'averageBalance', 0)
  const monthlyIncome = safeGet(aiData, 'monthlyIncome', 0)

  // Get confidences with safe defaults
  const schoolConfidence = safeGetConfidence(aiData, 'school', 0)
  const programConfidence = safeGetConfidence(aiData, 'program', 0)
  const durationConfidence = safeGetConfidence(aiData, 'duration', 0)
  const startDateConfidence = safeGetConfidence(aiData, 'startDate', 0)
  const annualTuitionConfidence = safeGetConfidence(aiData, 'annualTuition', 0)
  const cityConfidence = safeGetConfidence(aiData, 'city', 0)
  const fullNameConfidence = safeGetConfidence(aiData, 'fullName', 0)
  const nationalityConfidence = safeGetConfidence(aiData, 'nationality', 0)
  const passportExpiryConfidence = safeGetConfidence(aiData, 'passportExpiry', 0)
  const averageBalanceConfidence = safeGetConfidence(aiData, 'averageBalance', 0)
  const monthlyIncomeConfidence = safeGetConfidence(aiData, 'monthlyIncome', 0)

  const monthlyCost = city === 'Toronto' ? 1200 : 1000 // Default costs based on city
  const financialGap = Math.max(0, 
    (annualTuition * 2) + (monthlyCost * 24) - averageBalance
  )

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start max-w-[400px] mx-auto pb-32 relative">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-200 flex items-center px-4 py-3" style={{ maxWidth: 400 }}>
        <button
          type="button"
          className="mr-2 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 focus:outline-none"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-ca-blue" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1 text-center ml-[-2.5rem]">Review AI Analysis</h1>
      </header>

      {/* Subtitle and Success Banner */}
      <div className="w-full px-4 pt-5 pb-2">
        <div className="text-sm text-gray-700 font-medium mb-3 text-center">
          Here's what we found - just confirm or correct any details
        </div>
        <div className="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2 mb-4">
          <span className="text-lg">🤖</span>
          <span>AI analysis complete! We extracted your profile from uploaded documents</span>
        </div>
      </div>

      {/* Section 1: Study Program Details */}
      <div className="w-full px-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏫</span>
            <h2 className="text-base font-semibold text-gray-900">Study Program Details</h2>
          </div>
          <div className="space-y-0">
            <DataRow label="School" value={school} confidence={schoolConfidence} />
            <DataRow label="Program" value={program} confidence={programConfidence} />
            <DataRow label="Duration" value={duration} confidence={durationConfidence} />
            <DataRow label="Start Date" value={startDate} confidence={startDateConfidence} />
            <DataRow label="Annual Tuition" value={annualTuition} confidence={annualTuitionConfidence} />
            <DataRow label="City" value={`${city}, ON`} confidence={cityConfidence} />
          </div>
        </div>
      </div>

      {/* Section 2: Personal Information */}
      <div className="w-full px-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">👤</span>
            <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="space-y-0">
            <DataRow label="Full Name" value={fullName} confidence={fullNameConfidence} />
            <DataRow label="Nationality" value={nationality} confidence={nationalityConfidence} />
            <DataRow label="Passport Expiry" value={passportExpiry} confidence={passportExpiryConfidence} />
          </div>
        </div>
      </div>

      {/* Section 3: Financial Information */}
      <div className="w-full px-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💰</span>
            <h2 className="text-base font-semibold text-gray-900">Financial Information</h2>
          </div>
          <div className="space-y-0 mb-4">
            <DataRow label="Average Balance" value={averageBalance} confidence={averageBalanceConfidence} />
            <DataRow label="Monthly Income" value={monthlyIncome} confidence={monthlyIncomeConfidence} />
          </div>
          
          <FinancialCalculation
            annualTuition={annualTuition}
            duration={2}
            monthlyCost={monthlyCost}
            availableFunds={averageBalance}
          />
        </div>
      </div>

      {/* Missing Requirements Section */}
      {financialGap > 0 && (
        <div className="w-full px-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-base font-semibold text-yellow-800">What We Still Need</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-700 font-medium">You need CAD ${financialGap.toLocaleString()} more in funding</p>
              <div className="space-y-1">
                <p className="text-yellow-700">💡 Sponsor letter from parents for CAD ${financialGap.toLocaleString()}</p>
                <p className="text-yellow-700">💡 Education loan approval</p>
                <p className="text-yellow-700">💡 Scholarship/award letters</p>
              </div>
              <p className="text-yellow-700 mt-2">Missing documents: Official sealed transcripts needed</p>
            </div>
          </div>
        </div>
      )}

      {/* City Cost Validation */}
      <div className="w-full px-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">City Cost Validation</span>
            <button
              type="button"
              onClick={() => {}} // No dropdown for now, as city is directly extracted
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-xs">Edit</span>
            </button>
          </div>
          <div className="text-sm text-blue-700 mb-2">
            {city} - CAD ${monthlyCost.toLocaleString()}/month
          </div>
          <div className="text-xs text-blue-600">Does this look right?</div>
          
          {/* No dropdown for city as it's directly extracted */}
        </div>
      </div>

      {/* Bottom Sticky Section */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center bg-white border-t border-gray-200 z-30" style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="w-full px-4 py-3 flex flex-col items-center">
          <div className="flex items-center gap-2 text-sm text-green-700 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span>AI extraction complete - Ready for next step</span>
          </div>
          <button
            type="button"
            className="w-full py-3 rounded-lg font-semibold text-white bg-ca-blue shadow-md hover:bg-ca-blue/90 active:bg-ca-blue/80 transition-colors"
            onClick={() => {}}
          >
            Continue to Application Builder
          </button>
        </div>
      </div>
    </div>
  )
} 