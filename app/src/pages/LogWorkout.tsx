import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Trash2, Save, Dumbbell, Clock, Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router";

interface WorkoutSet {
  id: string;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number;
  notes: string;
}

export default function LogWorkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState("");
  const [notes] = useState("");
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const exercisesQuery = trpc.exercise.list.useQuery(
    { search: searchQuery || undefined, category: selectedCategory || undefined },
    { enabled: true }
  );
  const createWorkout = trpc.workout.create.useMutation({
    onSuccess: () => {
      utils.workout.list.invalidate();
      utils.workout.stats.invalidate();
      navigate("/");
    },
  });

  const exercises = exercisesQuery.data || [];

  const categories = [
    "all",
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
    "olympic",
    "cardio",
  ];

  const addSet = (exerciseId: number, exerciseName: string) => {
    const exerciseSets = sets.filter((s) => s.exerciseId === exerciseId);
    const newSet: WorkoutSet = {
      id: crypto.randomUUID(),
      exerciseId,
      exerciseName,
      setNumber: exerciseSets.length + 1,
      reps: 8,
      weight: 60,
      rpe: 7,
      notes: "",
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (id: string, field: keyof WorkoutSet, value: number | string) => {
    setSets(sets.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSet = (id: string) => {
    setSets(sets.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim() || sets.length === 0) return;
    const workoutSets = sets.map((s) => ({
      exerciseId: s.exerciseId,
      setNumber: s.setNumber,
      reps: s.reps,
      weight: s.weight,
      rpe: s.rpe || undefined,
      notes: s.notes || undefined,
    }));
    createWorkout.mutate({
      userId: user?.id || 1,
      userType: "oauth",
      title: title.trim(),
      notes: notes || undefined,
      duration,
      date,
      sets: workoutSets,
    });
  };

  // Group sets by exercise
  const groupedSets = sets.reduce((acc, set) => {
    if (!acc[set.exerciseId]) acc[set.exerciseId] = [];
    acc[set.exerciseId].push(set);
    return acc;
  }, {} as Record<number, WorkoutSet[]>);

  const totalVolume = sets.reduce((sum, s) => sum + s.reps * s.weight, 0);

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="max-w-[1280px] mx-auto px-6" style={{ padding: "40px 0 80px" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1
              style={{
                fontFamily: "'Saira', sans-serif",
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              LOG WORKOUT
            </h1>
            <p
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 13,
                color: "#8d8d8d",
                marginTop: 4,
              }}
            >
              Track every set. Every rep. Every kilogram.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="text-right"
              style={{
                fontFamily: "'Teko', sans-serif",
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "-0.05em",
                color: "#ccff00",
                lineHeight: 1,
              }}
            >
              {totalVolume.toLocaleString()}
              <span
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 11,
                  color: "#8d8d8d",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginLeft: 4,
                }}
              >
                KG VOL
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={!title.trim() || sets.length === 0 || createWorkout.isPending}
              className="btn-primary flex items-center gap-2"
              style={{ opacity: !title.trim() || sets.length === 0 ? 0.5 : 1 }}
            >
              <Save size={14} />
              {createWorkout.isPending ? "SAVING..." : "SAVE"}
            </button>
          </div>
        </div>

        {/* Workout Info */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          style={{ border: "1px solid #1a1a1a", padding: 20 }}
        >
          <div>
            <label
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 11,
                color: "#8d8d8d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              SESSION TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LEG DAY DESTROYER"
              className="input-field"
            />
          </div>
          <div>
            <label
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 11,
                color: "#8d8d8d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              <Clock size={11} className="inline mr-1" />
              DURATION (MIN)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input-field"
              min={1}
              max={300}
            />
          </div>
          <div>
            <label
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 11,
                color: "#8d8d8d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              <Calendar size={11} className="inline mr-1" />
              DATE
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Exercise Selector */}
          <div className="lg:col-span-2">
            <div
              className="sticky top-20"
              style={{
                border: "1px solid #1a1a1a",
                backgroundColor: "#0a0a0a",
              }}
            >
              {/* Search */}
              <div style={{ padding: 16, borderBottom: "1px solid #1a1a1a" }}>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#8d8d8d" }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exercises..."
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              {/* Category Filters */}
              <div
                className="flex gap-1 overflow-x-auto"
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === "all" ? "" : cat)}
                    style={{
                      fontFamily: "'Saira', sans-serif",
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "4px 10px",
                      whiteSpace: "nowrap",
                      color:
                        (selectedCategory === "" && cat === "all") ||
                        selectedCategory === cat
                          ? "#000"
                          : "#8d8d8d",
                      backgroundColor:
                        (selectedCategory === "" && cat === "all") ||
                        selectedCategory === cat
                          ? "#ccff00"
                          : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Exercise List */}
              <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addSet(ex.id, ex.name)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 transition-none hover:bg-[#1a1a1a]"
                    style={{
                      borderBottom: "1px solid #111111",
                    }}
                  >
                    <div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: "#1a1a1a",
                      }}
                    >
                      <Plus size={14} style={{ color: "#ccff00" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate"
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#ffffff",
                          textTransform: "uppercase",
                        }}
                      >
                        {ex.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontSize: 11,
                          color: "#8d8d8d",
                        }}
                      >
                        {ex.muscleGroup || ex.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sets Editor */}
          <div className="lg:col-span-3">
            {Object.keys(groupedSets).length === 0 ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  minHeight: 400,
                  border: "1px solid #1a1a1a",
                  color: "#8d8d8d",
                }}
              >
                <Dumbbell size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  SELECT AN EXERCISE TO BEGIN
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {Object.entries(groupedSets).map(([exId, exSets]) => (
                  <div
                    key={exId}
                    style={{
                      border: "1px solid #1a1a1a",
                      backgroundColor: "#0a0a0a",
                    }}
                  >
                    {/* Exercise Header */}
                    <div
                      className="flex items-center justify-between"
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #1a1a1a",
                        backgroundColor: "#111111",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          textTransform: "uppercase",
                          letterSpacing: "-0.02em",
                          color: "#ccff00",
                        }}
                      >
                        {exSets[0].exerciseName}
                      </h3>
                      <button
                        onClick={() => addSet(Number(exId), exSets[0].exerciseName)}
                        className="flex items-center gap-1 px-3 py-1 transition-none hover:bg-[#ccff00] hover:text-black"
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: "#8d8d8d",
                          border: "1px solid #1a1a1a",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={12} /> ADD SET
                      </button>
                    </div>

                    {/* Sets Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                            {["SET", "REPS", "WEIGHT", "RPE", ""].map((h) => (
                              <th
                                key={h}
                                className="text-left px-4 py-2"
                                style={{
                                  fontFamily: "'Saira', sans-serif",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: "#8d8d8d",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {exSets.map((set) => (
                            <tr
                              key={set.id}
                              style={{ borderBottom: "1px solid #111111" }}
                            >
                              <td
                                className="px-4 py-3"
                                style={{
                                  fontFamily: "'Saira', sans-serif",
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: "#ffffff",
                                }}
                              >
                                {set.setNumber}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) =>
                                    updateSet(set.id, "reps", Number(e.target.value))
                                  }
                                  className="input-field"
                                  style={{ width: 70, padding: "6px 10px", fontSize: 13 }}
                                  min={0}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) =>
                                      updateSet(set.id, "weight", Number(e.target.value))
                                    }
                                    className="input-field"
                                    style={{ width: 80, padding: "6px 10px", fontSize: 13 }}
                                    min={0}
                                    step={0.5}
                                  />
                                  <span
                                    style={{
                                      fontFamily: "'Saira', sans-serif",
                                      fontSize: 11,
                                      color: "#8d8d8d",
                                    }}
                                  >
                                    KG
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={set.rpe}
                                  onChange={(e) =>
                                    updateSet(set.id, "rpe", Number(e.target.value))
                                  }
                                  className="input-field"
                                  style={{ width: 60, padding: "6px 10px", fontSize: 13 }}
                                  min={1}
                                  max={10}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removeSet(set.id)}
                                  className="p-1 hover:text-red-500 transition-none"
                                  style={{ color: "#8d8d8d", background: "none", border: "none", cursor: "pointer" }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
