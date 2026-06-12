import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import { mkdirSync } from "fs"
import { dirname, resolve } from "path"

let dbInstance: Database.Database

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = process.env.DATABASE_URL || "./data/kinetic.db"
    const fullPath = dbPath.startsWith(".") ? resolve(process.cwd(), dbPath) : dbPath
    mkdirSync(dirname(fullPath), { recursive: true })
    dbInstance = new Database(fullPath)
    dbInstance.pragma("journal_mode = WAL")
    dbInstance.pragma("foreign_keys = ON")
  }
  return dbInstance
}
