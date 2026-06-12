import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import { mkdirSync } from "fs"
import { dirname, resolve } from "path"
import * as schema from "@db/schema"
import * as relations from "@db/relations"

const fullSchema = { ...schema, ...relations }

let instance: ReturnType<typeof drizzle<typeof fullSchema>>

export function getDb() {
  if (!instance) {
    const dbPath = process.env.DATABASE_URL || "./data/kinetic.db"
    const fullPath = dbPath.startsWith(".") ? resolve(process.cwd(), dbPath) : dbPath
    mkdirSync(dirname(fullPath), { recursive: true })
    const sqlite = new Database(fullPath)
    sqlite.pragma("journal_mode = WAL")
    sqlite.pragma("foreign_keys = ON")
    instance = drizzle(sqlite, { schema: fullSchema })
  }
  return instance
}

export { resolve as getDbPath }
