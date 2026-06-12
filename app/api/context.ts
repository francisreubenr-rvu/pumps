import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { User } from "@db/schema"
import { getDb } from "./lib/db"

export type TrpcContext = {
  req: Request
  resHeaders: Headers
  user?: User
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders }
  // Local dev: auto-create an admin user so we can use the app without OAuth
  try {
    const db = getDb()
    let user = db.prepare("SELECT * FROM users WHERE unionId = ?").get("dev-user") as User | undefined
    if (!user) {
      const result = db.prepare(
        "INSERT INTO users (unionId, name, role, createdAt, updatedAt, lastSignInAt) VALUES (?, ?, ?, ?, ?, ?)"
      ).run("dev-user", "Dev User", "admin", new Date().toISOString(), new Date().toISOString(), new Date().toISOString())
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(result.lastInsertRowid)) as User
    }
    ctx.user = user
  } catch {
    // DB may not be ready yet
  }
  return ctx
}
