"use server"

import { db } from "@/db"
import { documents } from "@/db/schema/documents-schema"
import { eq, or, like } from "drizzle-orm"
import fs from "fs"

export async function cleanupInvalidDocuments() {
  try {
    console.log('Starting document cleanup...')
    
    // Get all documents
    const allDocuments = await db.select().from(documents)
    console.log(`Found ${allDocuments.length} documents in database`)
    
    let deletedCount = 0
    let validCount = 0
    
    for (const doc of allDocuments) {
      const filePath = doc.storage_path
      
      // Check for invalid test paths that cause ENOENT errors
      if (filePath.startsWith('/test/') || filePath.startsWith('./test/') || filePath.includes('05-versions-space.pdf')) {
        console.log(`✗ Invalid test path: ${doc.filename} (${filePath})`)
        
        // Delete the record
        await db.delete(documents).where(eq(documents.id, doc.id))
        deletedCount++
        console.log(`  → Deleted record for ${doc.filename}`)
        continue
      }
      
      // Check if file exists (for other potential issues)
      if (fs.existsSync(filePath)) {
        validCount++
        console.log(`✓ Valid: ${doc.filename} (${filePath})`)
      } else {
        console.log(`✗ Missing: ${doc.filename} (${filePath})`)
        
        // Delete the record
        await db.delete(documents).where(eq(documents.id, doc.id))
        deletedCount++
        console.log(`  → Deleted record for ${doc.filename}`)
      }
    }
    
    console.log('\n=== Cleanup Summary ===')
    console.log(`Total documents: ${allDocuments.length}`)
    console.log(`Valid documents: ${validCount}`)
    console.log(`Deleted records: ${deletedCount}`)
    
    return {
      success: true,
      total: allDocuments.length,
      valid: validCount,
      deleted: deletedCount
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 