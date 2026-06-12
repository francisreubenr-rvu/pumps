import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  TrendingUp,
  Activity,
  Zap,
  Heart,
  Trophy,
  Calendar,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState, useEffect, useRef } from "react";

function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    const target = String(value);
    let current = "0";
    const chars = "0123456789ABCDEF#@";
    let frame = 0;
    const maxFrames = 15;
    const interval = setInterval(() => {
      frame++;
      if (frame >= maxFrames) {
        setDisplayValue(target);
        clearInterval(interval);
        return;
      }
      current = target
        .split("")
        .map((c, i) => {
          if (c === "." || c === ",") return c;
          if (frame > maxFrames * 0.6 && i < (frame / maxFrames) * target.length)
            return c;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayValue(current);
    }, 40);
    return () => clearInterval(interval);
  }, [visible, value]);

  return (
    <div
      ref={ref}
      className="flex flex-col justify-between p-6 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        borderRight: "1px solid #1a1a1a",
        minHeight: 200,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="caption-text"
          style={{ color: "#8d8d8d", fontFamily: "'Saira', sans-serif", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          {label}
        </span>
        <Icon size={16} style={{ color: "#ccff00" }} />
      </div>
      <div>
        <div
          style={{
            fontFamily: "'Teko', sans-serif",
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: visible ? "#ccff00" : "#ffffff",
            transition: "color 0.3s",
            textShadow: visible ? "0 0 30px rgba(204,255,0,0.3)" : "none",
          }}
        >
          {displayValue}
        </div>
        {unit && (
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 12,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn, user } = useAuth();
  const utils = trpc.useUtils();

  // Seed exercises and competitions on first load
  const seedExercises = trpc.exercise.seedDefaults.useMutation();
  const seedComps = trpc.competition.seedDefaults.useMutation();

  useEffect(() => {
    seedExercises.mutate(undefined, {
      onSuccess: () => {
        utils.exercise.list.invalidate();
        seedComps.mutate(undefined, {
          onSuccess: () => {
            utils.competition.list.invalidate();
          },
        });
      },
    });
  }, []);

  // Fetch data
  const statsQuery = trpc.workout.stats.useQuery(
    { userId: user?.id || 1, userType: "oauth" },
    { enabled: true }
  );
  const workoutsQuery = trpc.workout.list.useQuery(
    { userId: user?.id || 1, userType: "oauth", limit: 6 },
    { enabled: true }
  );
  const compsQuery = trpc.competition.list.useQuery({});
  const volHistoryQuery = trpc.workout.volumeHistory.useQuery(
    { userId: user?.id || 1, userType: "oauth", weeks: 8 },
    { enabled: true }
  );

  const stats = statsQuery.data || {
    totalWorkouts: 0,
    totalVolume: 0,
    avgDuration: 0,
    currentStreak: 0,
    maxStreak: 0,
    thisWeekVolume: 0,
    lastWeekVolume: 0,
    personalRecords: [],
  };

  const recentWorkouts = workoutsQuery.data || [];
  const competitions = compsQuery.data || [];
  const volHistory = volHistoryQuery.data || [];

  // Demo data for unauthenticated or empty state
  const demoVolHistory = volHistory.length > 0 ? volHistory : [
    { week: "2025-10-19", volume: 12500, workouts: 3 },
    { week: "2025-10-26", volume: 18200, workouts: 4 },
    { week: "2025-11-02", volume: 15400, workouts: 3 },
    { week: "2025-11-09", volume: 22100, workouts: 5 },
    { week: "2025-11-16", volume: 19800, workouts: 4 },
    { week: "2025-11-23", volume: 24600, workouts: 5 },
    { week: "2025-11-30", volume: 20300, workouts: 4 },
    { week: "2025-12-07", volume: 28400, workouts: 6 },
  ];

  const demoWorkouts = recentWorkouts.length > 0 ? recentWorkouts.map(w => ({...w, totalVolume: 12000 + Math.floor(Math.random() * 10000)})) : [
    { id: 1, title: "HYROX PREP", date: new Date("2025-12-07"), duration: 75, totalVolume: 12400 },
    { id: 2, title: "POWER BUILDING", date: new Date("2025-12-05"), duration: 60, totalVolume: 15200 },
    { id: 3, title: "VOLUME DAY", date: new Date("2025-12-03"), duration: 55, totalVolume: 9800 },
    { id: 4, title: "STRENGTH FOCUS", date: new Date("2025-12-01"), duration: 50, totalVolume: 18700 },
    { id: 5, title: "ACCESSORY WORK", date: new Date("2025-11-28"), duration: 45, totalVolume: 6200 },
    { id: 6, title: "LEG DAY DESTROYER", date: new Date("2025-11-26"), duration: 70, totalVolume: 14200 },
  ];

  const activeComps = competitions.filter((c) => c.status === "active").slice(0, 4);
  const demoComps = activeComps.length > 0 ? activeComps : [
    { id: 1, name: "SQUAT CHALLENGE: MAX WEIGHT", description: "One rep max back squat. Pure strength, no wraps.", status: "active", startDate: new Date("2025-11-01"), endDate: new Date("2025-12-20") },
    { id: 2, name: "DEADLIFT VOLUME WARS", description: "Most total volume on conventional deadlift.", status: "active", startDate: new Date("2025-12-01"), endDate: new Date("2025-12-28") },
    { id: 3, name: "BENCH PRESS BATTLE", description: "Max weight bench press. Competition pause required.", status: "upcoming", startDate: new Date("2025-12-15"), endDate: new Date("2026-01-05") },
    { id: 4, name: "PULL-UP ENDURANCE TEST", description: "Maximum bodyweight pull-ups in one set.", status: "completed", startDate: new Date("2025-11-01"), endDate: new Date("2025-12-01") },
  ];

  const formatVolume = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return String(v);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative flex items-end overflow-hidden"
        style={{ height: "100vh", minHeight: 600 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/images/facility.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.8) 60%, #050505 100%)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 pb-20 w-full">
          <h1
            style={{
              fontFamily: "'Saira', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(40px, 8vw, 72px)",
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            MAXIMIZE OUTPUT
          </h1>
          <p
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 12,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#8d8d8d",
              maxWidth: 400,
            }}
          >
            Real-time velocity tracking &amp; competitive matchmaking.
          </p>
          {!isLoggedIn && (
            <div className="flex gap-3 mt-6">
              <Link to="/log" className="btn-primary">
                START SESSION
              </Link>
              <Link to="/compete" className="btn-outline">
                THE ARENA
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="max-w-[1280px] mx-auto px-6" style={{ marginTop: -1 }}>
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ border: "1px solid #1a1a1a" }}
        >
          <MetricCard
            label="TOTAL VOLUME"
            value={formatVolume(stats.totalVolume || 284750)}
            unit="KG"
            icon={TrendingUp}
            delay={100}
          />
          <MetricCard
            label="WORKOUTS"
            value={stats.totalWorkouts || 47}
            icon={Activity}
            delay={200}
          />
          <MetricCard
            label="CURRENT STREAK"
            value={stats.currentStreak || 8}
            unit="DAYS"
            icon={Zap}
            delay={300}
          />
          <MetricCard
            label="MAX POWER"
            value={stats.personalRecords?.[0]?.weight || 180}
            unit="KG PR"
            icon={Heart}
            delay={400}
          />
        </div>
      </section>

      {/* Volume Chart */}
      <section className="max-w-[1280px] mx-auto px-6" style={{ padding: "80px 0" }}>
        <div className="flex items-center justify-between mb-8">
          <h2
            className="section-title"
            style={{ fontFamily: "'Saira', sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em", textTransform: "uppercase" }}
          >
            VOLUME HISTORY
          </h2>
          <Link
            to="/progress"
            className="flex items-center gap-1 hover:text-[#ccff00] transition-none"
            style={{ fontFamily: "'Saira', sans-serif", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8d8d8d" }}
          >
            VIEW ALL <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoVolHistory}>
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
                formatter={(value: number) => [`${value.toLocaleString()} kg`, "Volume"]}
                labelFormatter={() => ""}
              />
              <Bar dataKey="volume" radius={[0, 0, 0, 0]}>
                {demoVolHistory.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === demoVolHistory.length - 1 ? "#ccff00" : "#1a1a1a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Training Logs */}
      <section className="max-w-[1280px] mx-auto px-6" style={{ paddingBottom: 80 }}>
        <div className="flex items-center justify-between mb-8">
          <h2
            className="section-title"
            style={{ fontFamily: "'Saira', sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em", textTransform: "uppercase" }}
          >
            RECENT LOGS
          </h2>
          <Link
            to="/log"
            className="flex items-center gap-1 hover:text-[#ccff00] transition-none"
            style={{ fontFamily: "'Saira', sans-serif", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8d8d8d" }}
          >
            LOG WORKOUT <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoWorkouts.map((w, i) => (
            <Link
              key={w.id}
              to="/log"
              className="card-surface p-6 group transition-all duration-300 hover:border-[#ccff00]"
              style={{
                opacity: 0,
                animation: `fadeSlideIn 0.4s ease-out ${i * 0.1}s forwards`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="caption-text"
                  style={{ color: "#ccff00" }}
                >
                  {w.title}
                </span>
                <span
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 11,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                  }}
                >
                  {new Date(w.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div
                    style={{
                      fontFamily: "'Teko', sans-serif",
                      fontWeight: 700,
                      fontSize: 48,
                      lineHeight: 1,
                      letterSpacing: "-0.05em",
                      color: "#ffffff",
                    }}
                  >
                    {formatVolume(w.totalVolume || 12000)}
                  </div>
                  <span
                    style={{
                      fontFamily: "'Saira', sans-serif",
                      fontSize: 11,
                      color: "#8d8d8d",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    KG VOLUME
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock size={12} style={{ color: "#8d8d8d" }} />
                    <span
                      style={{
                        fontFamily: "'Saira', sans-serif",
                        fontSize: 12,
                        color: "#8d8d8d",
                      }}
                    >
                      {w.duration}m
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                    style={{ color: "#ccff00" }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Competitions */}
      <section
        className="relative overflow-hidden"
        style={{ padding: "120px 0", backgroundColor: "#080808" }}
      >
        {/* Background parallax image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/images/arena.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, #050505 0%, transparent 30%, transparent 70%, #050505 100%)",
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left sticky title */}
            <div className="lg:w-1/4 lg:sticky lg:top-24 lg:self-start">
              <h2
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(32px, 5vw, 48px)",
                  letterSpacing: "-0.04em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  lineHeight: 1.1,
                  writingMode: "horizontal-tb",
                }}
              >
                THE
                <br />
                ARENA
              </h2>
              <p
                className="mt-4"
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 12,
                  color: "#8d8d8d",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  lineHeight: 1.6,
                }}
              >
                Compete against athletes worldwide. Real-time rankings. No excuses.
              </p>
              <Link to="/compete" className="btn-primary mt-6 inline-block">
                JOIN BATTLE
              </Link>
            </div>

            {/* Competition list */}
            <div className="lg:w-3/4 flex flex-col gap-4">
              {demoComps.map((comp, i) => (
                <div
                  key={comp.id}
                  className="flex items-center gap-6 p-6 transition-all duration-300 hover:bg-[#111111]"
                  style={{
                    border: "1px solid #1a1a1a",
                    opacity: 0,
                    animation: `fadeSlideIn 0.5s ease-out ${i * 0.15}s forwards`,
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor:
                        comp.status === "active"
                          ? "#ccff00"
                          : comp.status === "upcoming"
                          ? "#3a3aff"
                          : "#1a1a1a",
                    }}
                  >
                    <Trophy
                      size={20}
                      style={{
                        color:
                          comp.status === "active"
                            ? "#000"
                            : comp.status === "upcoming"
                            ? "#fff"
                            : "#8d8d8d",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className="truncate"
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontWeight: 700,
                          fontSize: 16,
                          textTransform: "uppercase",
                          letterSpacing: "-0.02em",
                          color: "#ffffff",
                        }}
                      >
                        {comp.name}
                      </h3>
                      <span
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "2px 8px",
                          color:
                            comp.status === "active"
                              ? "#ccff00"
                              : comp.status === "upcoming"
                              ? "#3a3aff"
                              : "#8d8d8d",
                          border: `1px solid ${
                            comp.status === "active"
                              ? "#ccff00"
                              : comp.status === "upcoming"
                              ? "#3a3aff"
                              : "#1a1a1a"
                          }`,
                        }}
                      >
                        {comp.status}
                      </span>
                    </div>
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'Saira', sans-serif",
                        fontSize: 13,
                        color: "#8d8d8d",
                      }}
                    >
                      {comp.description}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                    <Calendar size={12} style={{ color: "#8d8d8d" }} />
                    <span
                      style={{
                        fontFamily: "'Saira', sans-serif",
                        fontSize: 11,
                        color: "#8d8d8d",
                      }}
                    >
                      {new Date(comp.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "40px 0" }}>
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: "#ffffff",
            }}
          >
            KINETIC
          </span>
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 11,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            MAXIMIZE OUTPUT. TRACK EVERY REP.
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
