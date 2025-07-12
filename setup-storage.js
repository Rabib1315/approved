import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are required")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupStorage() {
  try {
    console.log("Setting up Supabase storage...")
    
    // Check if documents bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return
    }
    
    console.log("Existing buckets:", buckets.map(b => b.name))
    
    const documentsBucket = buckets.find(b => b.name === "documents")
    
    if (!documentsBucket) {
      console.log("Creating documents bucket...")
      const { data: newBucket, error: createError } = await supabase.storage.createBucket("documents", {
        public: false,
        allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error("Error creating bucket:", createError)
        return
      }
      
      console.log("Documents bucket created successfully")
    } else {
      console.log("Documents bucket already exists")
    }
    
    // Test upload to verify permissions using a supported MIME type
    console.log("Testing upload permissions...")
    const testFile = new Blob(["test content"], { type: "application/pdf" })
    const testFileName = "test-upload.pdf"
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(testFileName, testFile, {
        cacheControl: "3600",
        upsert: true
      })
    
    if (uploadError) {
      console.error("Upload test failed:", uploadError)
      console.log("This means the storage bucket doesn't have proper permissions")
      return
    }
    
    console.log("Upload test successful!")
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from("documents")
      .remove([testFileName])
    
    if (deleteError) {
      console.warn("Could not delete test file:", deleteError)
    } else {
      console.log("Test file cleaned up")
    }
    
    console.log("Storage setup completed successfully!")
    
  } catch (error) {
    console.error("Storage setup failed:", error)
  }
}

setupStorage() 