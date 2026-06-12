import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Search } from "lucide-react"

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .order("category")

  const categories = [...new Set(exercises?.map((e) => e.category) ?? [])]

  async function addExercise(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const name = formData.get("name") as string
    const category = formData.get("category") as string

    if (!name || !category) return

    await supabase.from("exercises").insert({
      name,
      category,
      created_by: user.id,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
          <p className="text-zinc-400">Browse and create exercises</p>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Add Custom Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="name" className="text-zinc-300">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Bulgarian Split Squat"
                required
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="w-48 space-y-1">
              <Label htmlFor="category" className="text-zinc-300">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g. legs"
                required
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                formAction={addExercise}
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-lg font-semibold capitalize text-white">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises
              ?.filter((e) => e.category === category)
              .map((exercise) => (
                <Card key={exercise.id} className="border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700">
                  <CardContent className="p-4">
                    <p className="font-medium text-white">{exercise.name}</p>
                    <p className="mt-1 text-xs text-zinc-500 capitalize">{exercise.category}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {(!exercises || exercises.length === 0) && (
        <p className="py-12 text-center text-zinc-500">No exercises found. Add one above.</p>
      )}
    </div>
  )
}
