import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Flame,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#ccff00", "#3a3aff", "#ff0000", "#8d8d8d", "#ffffff", "#1a1a1a"];

export default function Progress() {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<"4w" | "8w" | "12w" | "6m">("12w");

  const statsQuery = trpc.workout.stats.useQuery(
    { userId: user?.id || 1, userType: "oauth" },
    { enabled: true }
  );
  const volHistoryQuery = trpc.workout.volumeHistory.useQuery(
    { userId: user?.id || 1, userType: "oauth", weeks: timeRange === "4w" ? 4 : timeRange === "8w" ? 8 : timeRange === "12w" ? 12 : 24 },
    { enabled: true }
  );
  const bodyPartQuery = trpc.progress.bodyPartBreakdown.useQuery(
    { userId: user?.id || 1, userType: "oauth" },
    { enabled: true }
  );
  const exerciseProgressQuery = trpc.progress.exerciseProgress.useQuery(
    { userId: user?.id || 1, userType: "oauth", exerciseId: selectedExercise, weeks: 24 },
    { enabled: true }
  );
  const exercisesQuery = trpc.exercise.list.useQuery({});

  const stats = statsQuery.data || {
    totalWorkouts: 47,
    totalVolume: 284750,
    avgDuration: 58,
    currentStreak: 8,
    maxStreak: 15,
    thisWeekVolume: 3,
    lastWeekVolume: 4,
    personalRecords: [
      { exercise: "Barbell Back Squat", weight: 180, reps: 1 },
      { exercise: "Conventional Deadlift", weight: 210, reps: 1 },
      { exercise: "Bench Press", weight: 140, reps: 1 },
      { exercise: "Overhead Press", weight: 85, reps: 3 },
    ],
  };

  const volHistory = volHistoryQuery.data || [];
  const bodyParts = bodyPartQuery.data || [];
  const exerciseProgress = exerciseProgressQuery.data || [];
  const exercises = exercisesQuery.data || [];

  // Demo data
  const demoVolHistory = volHistory.length > 0 ? volHistory : [
    { week: "2025-09-15", volume: 8900, workouts: 2 },
    { week: "2025-09-22", volume: 11200, workouts: 3 },
    { week: "2025-09-29", volume: 10500, workouts: 3 },
    { week: "2025-10-06", volume: 13800, workouts: 4 },
    { week: "2025-10-13", volume: 12500, workouts: 3 },
    { week: "2025-10-20", volume: 18200, workouts: 4 },
    { week: "2025-10-27", volume: 15400, workouts: 3 },
    { week: "2025-11-03", volume: 22100, workouts: 5 },
    { week: "2025-11-10", volume: 19800, workouts: 4 },
    { week: "2025-11-17", volume: 24600, workouts: 5 },
    { week: "2025-11-24", volume: 20300, workouts: 4 },
    { week: "2025-12-01", volume: 28400, workouts: 6 },
  ];

  const demoBodyParts = bodyParts.length > 0 ? bodyParts : [
    { category: "legs", volume: 98400, sets: 142, percentage: 38 },
    { category: "back", volume: 52600, sets: 89, percentage: 22 },
    { category: "chest", volume: 42100, sets: 72, percentage: 17 },
    { category: "shoulders", volume: 28400, sets: 48, percentage: 11 },
    { category: "arms", volume: 31500, sets: 54, percentage: 12 },
  ];

  const demoExerciseProgress = exerciseProgress.length > 0 ? exerciseProgress : [
    { date: "2025-06-15", maxWeight: 120, totalReps: 24, sets: 5 },
    { date: "2025-07-01", maxWeight: 125, totalReps: 18, sets: 4 },
    { date: "2025-07-15", maxWeight: 130, totalReps: 21, sets: 5 },
    { date: "2025-08-01", maxWeight: 135, totalReps: 15, sets: 3 },
    { date: "2025-08-15", maxWeight: 140, totalReps: 20, sets: 4 },
    { date: "2025-09-01", maxWeight: 145, totalReps: 18, sets: 4 },
    { date: "2025-09-15", maxWeight: 150, totalReps: 22, sets: 5 },
    { date: "2025-10-01", maxWeight: 155, totalReps: 16, sets: 3 },
    { date: "2025-10-15", maxWeight: 160, totalReps: 19, sets: 4 },
    { date: "2025-11-01", maxWeight: 165, totalReps: 24, sets: 5 },
    { date: "2025-11-15", maxWeight: 170, totalReps: 20, sets: 4 },
    { date: "2025-12-01", maxWeight: 180, totalReps: 18, sets: 4 },
  ];

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="max-w-[1280px] mx-auto px-6" style={{ padding: "40px 0 80px" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
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
              PROGRESS
            </h1>
            <p
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 13,
                color: "#8d8d8d",
                marginTop: 4,
              }}
            >
              Track your strength evolution. Visualize your gains.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["4w", "8w", "12w", "6m"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "6px 14px",
                  color: timeRange === r ? "#000" : "#8d8d8d",
                  backgroundColor: timeRange === r ? "#ccff00" : "transparent",
                  border: timeRange === r ? "none" : "1px solid #1a1a1a",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "TOTAL WORKOUTS",
              value: stats.totalWorkouts,
              icon: Calendar,
            },
            {
              label: "TOTAL VOLUME",
              value: `${(stats.totalVolume / 1000).toFixed(0)}k`,
              unit: "KG",
              icon: BarChart3,
            },
            {
              label: "CURRENT STREAK",
              value: stats.currentStreak,
              unit: "DAYS",
              icon: Flame,
            },
            {
              label: "PERSONAL RECORDS",
              value: stats.personalRecords?.length || 0,
              icon: Target,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="p-5"
              style={{
                border: "1px solid #1a1a1a",
                backgroundColor: "#0a0a0a",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {card.label}
                </span>
                <card.icon size={14} style={{ color: "#ccff00" }} />
              </div>
              <div
                style={{
                  fontFamily: "'Teko', sans-serif",
                  fontWeight: 700,
                  fontSize: 40,
                  letterSpacing: "-0.05em",
                  color: "#ccff00",
                  lineHeight: 1,
                }}
              >
                {card.value}
              </div>
              {card.unit && (
                <span
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 11,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {card.unit}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Volume Over Time */}
        <div className="mb-10">
          <h2
            className="mb-6"
            style={{
              fontFamily: "'Saira', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            VOLUME TREND
          </h2>
          <div
            className="p-6"
            style={{
              border: "1px solid #1a1a1a",
              backgroundColor: "#0a0a0a",
              height: 350,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoVolHistory}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tick={{ fill: "#8d8d8d", fontSize: 11, fontFamily: "'Saira', sans-serif" }}
                  axisLine={{ stroke: "#1a1a1a" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: "#8d8d8d", fontSize: 11, fontFamily: "'Saira', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111111",
                    border: "1px solid #1a1a1a",
                    borderRadius: 0,
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} kg`,
                    "Volume",
                  ]}
                  labelFormatter={() => ""}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#ccff00"
                  strokeWidth={2}
                  fill="url(#volGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column: Exercise Progress + Body Part Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Exercise Strength Progress */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                STRENGTH CURVE
              </h2>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(Number(e.target.value))}
                className="input-field"
                style={{
                  width: "auto",
                  padding: "6px 12px",
                  fontSize: 12,
                  borderColor: "#1a1a1a",
                }}
              >
                {exercises.slice(0, 10).map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
                {exercises.length === 0 && [
                  { id: 1, name: "Barbell Back Squat" },
                  { id: 2, name: "Conventional Deadlift" },
                  { id: 3, name: "Bench Press" },
                  { id: 4, name: "Overhead Press" },
                  { id: 5, name: "Barbell Row" },
                ].map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="p-6"
              style={{
                border: "1px solid #1a1a1a",
                backgroundColor: "#0a0a0a",
                height: 300,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoExerciseProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                    tick={{
                      fill: "#8d8d8d",
                      fontSize: 11,
                      fontFamily: "'Saira', sans-serif",
                    }}
                    axisLine={{ stroke: "#1a1a1a" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8d8d8d", fontSize: 11, fontFamily: "'Saira', sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #1a1a1a",
                      borderRadius: 0,
                      fontFamily: "'Saira', sans-serif",
                      fontSize: 12,
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value} kg`, "Max Weight"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="#ccff00"
                    strokeWidth={2}
                    dot={{ fill: "#ccff00", r: 4 }}
                    activeDot={{ fill: "#ffffff", r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalReps"
                    stroke="#3a3aff"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Body Part Breakdown */}
          <div>
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              BODY PART SPLIT
            </h2>
            <div
              className="p-6"
              style={{
                border: "1px solid #1a1a1a",
                backgroundColor: "#0a0a0a",
                height: 300,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoBodyParts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="volume"
                    nameKey="category"
                  >
                    {demoBodyParts.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid #1a1a1a",
                      borderRadius: 0,
                      fontFamily: "'Saira', sans-serif",
                      fontSize: 12,
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} kg (${
                        demoBodyParts.find((b) => b.category === name)?.percentage || 0
                      }%)`,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Personal Records Table */}
        <div>
          <h2
            className="mb-6"
            style={{
              fontFamily: "'Saira', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            PERSONAL RECORDS
          </h2>
          <div style={{ border: "1px solid #1a1a1a" }}>
            {/* Table header */}
            <div
              className="grid grid-cols-3 gap-4 px-6 py-3"
              style={{
                borderBottom: "1px solid #1a1a1a",
                backgroundColor: "#111111",
              }}
            >
              {["EXERCISE", "WEIGHT", "REPS"].map((h) => (
                <div
                  key={h}
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
                </div>
              ))}
            </div>
            {/* Rows */}
            {(stats.personalRecords || []).map((pr, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 px-6 py-4 transition-none hover:bg-[#111111]"
                style={{ borderBottom: "1px solid #111111" }}
              >
                <div
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#ffffff",
                    textTransform: "uppercase",
                  }}
                >
                  {pr.exercise}
                </div>
                <div
                  style={{
                    fontFamily: "'Teko', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "-0.03em",
                    color: "#ccff00",
                  }}
                >
                  {pr.weight}
                  <span
                    style={{
                      fontFamily: "'Saira', sans-serif",
                      fontSize: 10,
                      color: "#8d8d8d",
                      marginLeft: 4,
                    }}
                  >
                    KG
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 13,
                    color: "#8d8d8d",
                  }}
                >
                  {pr.reps} {pr.reps === 1 ? "rep" : "reps"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
