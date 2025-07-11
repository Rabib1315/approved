const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testConnections() {
  console.log('🔍 Testing Supabase Connections...\n')

  // Test 1: Check environment variables
  console.log('1. Checking Environment Variables:')
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
  console.log('')

  // Test 2: Test Supabase client connection
  console.log('2. Testing Supabase Client Connection:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('   ❌ Supabase client error:', error.message)
    } else {
      console.log('   ✅ Supabase client connected successfully')
    }
  } catch (error) {
    console.log('   ❌ Supabase client connection failed:', error.message)
  }
  console.log('')

  // Test 3: Test database connection via Drizzle
  console.log('3. Testing Database Connection (Drizzle):')
  try {
    const { drizzle } = require('drizzle-orm/postgres-js')
    const postgres = require('postgres')
    const { sql } = require('drizzle-orm')
    
    const client = postgres(process.env.DATABASE_URL)
    const db = drizzle(client)
    
    // Test a simple query
    const result = await db.execute(sql`SELECT 1 as test`)
    console.log('   ✅ Database connection successful')
    console.log('   Result:', result)
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message)
  }
  console.log('')

  // Test 4: Test storage bucket access
  console.log('4. Testing Storage Access:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.log('   ❌ Storage access error:', error.message)
    } else {
      console.log('   ✅ Storage access successful')
      console.log('   Available buckets:', data.map(b => b.name))
    }
  } catch (error) {
    console.log('   ❌ Storage access failed:', error.message)
  }
  console.log('')

  console.log('🏁 Connection test complete!')
}

testConnections().catch(console.error) 