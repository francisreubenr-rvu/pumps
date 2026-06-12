import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Users,
  Calendar,
  Zap,
  ArrowRight,
  Clock,
  ChevronRight,
  Target,
  Activity,
} from "lucide-react";
import { Link } from "react-router";

interface CompetitionCardProps {
  name: string;
  description: string | null;
  type: string;
  status: string;
  endDate: Date;
  participantCount?: number;
  delay: number;
}

function CompetitionCard({
  name,
  description,
  type,
  status,
  endDate,
  participantCount,
  delay,
}: CompetitionCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const statusColor =
    status === "active" ? "#ccff00" : status === "upcoming" ? "#3a3aff" : "#8d8d8d";
  const TypeIcon =
    type === "max_weight" ? Target : type === "total_volume" ? Activity : Zap;

  return (
    <div
      className="group transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        border: "1px solid #1a1a1a",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Top bar with status */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: statusColor,
            }}
          />
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: statusColor,
            }}
          >
            {status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={12} style={{ color: "#8d8d8d" }} />
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 11,
              color: "#8d8d8d",
            }}
          >
            {participantCount} competitors
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#111111",
            }}
          >
            <TypeIcon size={20} style={{ color: "#ccff00" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              style={{
                fontFamily: "'Saira', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "#ffffff",
                lineHeight: 1.3,
                marginBottom: 4,
              }}
            >
              {name}
            </h3>
            <p
              className="line-clamp-2"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 12,
                color: "#8d8d8d",
                lineHeight: 1.4,
              }}
            >
              {description || "No description"}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={12} style={{ color: "#8d8d8d" }} />
              <span
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 11,
                  color: "#8d8d8d",
                  textTransform: "uppercase",
                }}
              >
                Ends{" "}
                {new Date(endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 8px",
                color: "#8d8d8d",
                border: "1px solid #1a1a1a",
              }}
            >
              {type.replace("_", " ")}
            </div>
          </div>

          <Link
            to={`/compete`}
            className="flex items-center gap-1 transition-none group-hover:text-[#ccff00]"
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#8d8d8d",
            }}
          >
            DETAILS <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Competitions() {
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "completed">("all");

  const compsQuery = trpc.competition.list.useQuery({});
  const leaderboardQuery = trpc.leaderboard.byVolume.useQuery({ limit: 5 });

  const competitions = compsQuery.data || [];
  const leaderboard = leaderboardQuery.data || [];

  // Demo data
  const demoComps = competitions.length > 0 ? competitions : [
    { id: 1, name: "SQUAT CHALLENGE: MAX WEIGHT", description: "One rep max back squat. Pure strength, no wraps. Belt allowed.", type: "max_weight", status: "active", startDate: new Date("2025-11-01"), endDate: new Date("2025-12-20"), participantCount: 142 },
    { id: 2, name: "DEADLIFT VOLUME WARS", description: "Most total volume on conventional deadlift in one session.", type: "total_volume", status: "active", startDate: new Date("2025-12-01"), endDate: new Date("2025-12-28"), participantCount: 89 },
    { id: 3, name: "BENCH PRESS BATTLE", description: "Max weight bench press. Competition pause required.", type: "max_weight", status: "upcoming", startDate: new Date("2025-12-15"), endDate: new Date("2026-01-05"), participantCount: 0 },
    { id: 4, name: "PULL-UP ENDURANCE TEST", description: "Maximum bodyweight pull-ups in one set. Full dead hang required.", type: "max_reps", status: "completed", startDate: new Date("2025-11-01"), endDate: new Date("2025-12-01"), participantCount: 203 },
    { id: 5, name: "OLYMPIC TOTAL CHASE", description: "Combined max of snatch and clean & jerk. IWF standards.", type: "max_weight", status: "upcoming", startDate: new Date("2026-01-01"), endDate: new Date("2026-02-01"), participantCount: 0 },
    { id: 6, name: "10K KILOGRAM CLUB", description: "First to accumulate 10,000 kg of training volume in one week.", type: "total_volume", status: "active", startDate: new Date("2025-12-05"), endDate: new Date("2025-12-12"), participantCount: 67 },
  ];

  const filtered =
    filter === "all"
      ? demoComps
      : demoComps.filter((c) => c.status === filter);

  const filters: Array<"all" | "active" | "upcoming" | "completed"> = [
    "all",
    "active",
    "upcoming",
    "completed",
  ];

  const demoLeaderboard = leaderboard.length > 0 ? leaderboard : [
    { rank: 1, name: "Marcus Steel", totalVolume: 452300, workouts: 48 },
    { rank: 2, name: "Elena Voss", totalVolume: 418200, workouts: 52 },
    { rank: 3, name: "Jax Power", totalVolume: 395100, workouts: 44 },
    { rank: 4, name: "Nova Chen", totalVolume: 371800, workouts: 41 },
    { rank: 5, name: "Kai Titan", totalVolume: 354200, workouts: 38 },
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
              THE ARENA
            </h1>
            <p
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 13,
                color: "#8d8d8d",
                marginTop: 4,
              }}
            >
              Compete. Climb. Conquer. Real-time challenges against athletes worldwide.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "6px 14px",
                  color: filter === f ? "#000" : "#8d8d8d",
                  backgroundColor: filter === f ? "#ccff00" : "transparent",
                  border: filter === f ? "none" : "1px solid #1a1a1a",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Competition List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {filtered.map((comp, i) => (
              <CompetitionCard
                key={comp.id}
                name={comp.name}
                description={comp.description}
                type={comp.type}
                status={comp.status}
                endDate={comp.endDate}
                participantCount={(comp as { participantCount?: number }).participantCount || 0}
                delay={i * 100}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Live Rankings */}
            <div style={{ border: "1px solid #1a1a1a", backgroundColor: "#0a0a0a" }}>
              <div
                className="flex items-center gap-2 px-5 py-4"
                style={{ borderBottom: "1px solid #1a1a1a" }}
              >
                <Zap size={14} style={{ color: "#ccff00" }} />
                <h3
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                  }}
                >
                  LIVE RANKINGS
                </h3>
              </div>
              <div>
                {demoLeaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 transition-none hover:bg-[#111111]"
                    style={{ borderBottom: "1px solid #111111" }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor:
                          entry.rank === 1
                            ? "#ccff00"
                            : entry.rank === 2
                            ? "#8d8d8d"
                            : entry.rank === 3
                            ? "#8d8d8d"
                            : "#1a1a1a",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontWeight: 700,
                          fontSize: 12,
                          color: entry.rank <= 3 ? "#000" : "#8d8d8d",
                        }}
                      >
                        {entry.rank}
                      </span>
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
                        {entry.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        style={{
                          fontFamily: "'Teko', sans-serif",
                          fontWeight: 700,
                          fontSize: 20,
                          letterSpacing: "-0.03em",
                          color: "#ccff00",
                          lineHeight: 1,
                        }}
                      >
                        {entry.totalVolume >= 1000
                          ? `${(entry.totalVolume / 1000).toFixed(1)}k`
                          : entry.totalVolume}
                      </div>
                      <span
                        style={{
                          fontFamily: "'Saira', sans-serif",
                          fontSize: 10,
                          color: "#8d8d8d",
                          textTransform: "uppercase",
                        }}
                      >
                        KG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/leaderboard"
                className="flex items-center justify-center gap-1 py-3 transition-none hover:bg-[#111111]"
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#8d8d8d",
                  borderTop: "1px solid #1a1a1a",
                }}
              >
                VIEW FULL RANKINGS <ArrowRight size={12} />
              </Link>
            </div>

            {/* Active Competitors */}
            <div
              className="relative overflow-hidden"
              style={{
                border: "1px solid #1a1a1a",
                backgroundColor: "#0a0a0a",
                padding: 24,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/images/athlete.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.15,
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} style={{ color: "#ccff00" }} />
                  <span
                    style={{
                      fontFamily: "'Saira', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#ccff00",
                    }}
                  >
                    NOW ACTIVE
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Teko', sans-serif",
                    fontWeight: 700,
                    fontSize: 64,
                    letterSpacing: "-0.05em",
                    color: "#ffffff",
                    lineHeight: 1,
                  }}
                >
                  1,247
                </div>
                <span
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 12,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  ATHLETES COMPETING RIGHT NOW
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
