import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Swords } from "lucide-react"

export default async function CompetitionsPage() {
  const supabase = await createClient()

  const { data: competitions } = await supabase
    .from("competitions")
    .select("*, exercises(name), competition_participants(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitions</h1>
          <p className="text-zinc-400">Live workout battles</p>
        </div>
        <Link href="/competitions/new">
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Competition
          </Button>
        </Link>
      </div>

      {!competitions || competitions.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="flex flex-col items-center py-12">
            <Swords className="h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-500">No competitions yet</p>
            <Link href="/competitions/new" className="mt-4">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700">
                Create the First Competition
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((c) => (
            <Link key={c.id} href={`/competitions/${c.id}`}>
              <Card className={`border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 ${c.status === 'active' ? 'ring-1 ring-green-600' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{c.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {(c as any).exercises?.name ?? "Unknown"} —{" "}
                        {c.type.replace("_", " ")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        c.status === "active" ? "default" :
                        c.status === "completed" ? "secondary" : "outline"
                      }
                      className={
                        c.status === "active" ? "bg-green-600" : ""
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
                    <Swords className="h-3 w-3" />
                    {(c as any).competition_participants?.[0]?.count ?? 0} participants
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
