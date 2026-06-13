import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Ensure it is set in .env.local or your deployment environment.`
    )
  }
  return value
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const url = getEnvVar("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl)
  const key = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)

  supabaseClient = createBrowserClient(url, key)
  return supabaseClient
}
