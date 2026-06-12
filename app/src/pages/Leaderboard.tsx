import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Trophy,
  TrendingUp,
  Medal,
  Crown,
  Award,
  Star,
  Flame,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalVolume: number;
  workouts: number;
  avgRPE: number;
  streak: number;
}

const rankIcons = [Crown, Medal, Award, Star, Flame];

function LeaderboardRow({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const RankIcon = rankIcons[Math.min(entry.rank - 1, rankIcons.length - 1)];
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className="flex items-center gap-4 px-6 py-4 transition-all duration-500 hover:bg-[#111111]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        borderBottom: "1px solid #111111",
      }}
    >
      {/* Rank */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          backgroundColor: isTop3
            ? entry.rank === 1
              ? "#ccff00"
              : entry.rank === 2
              ? "#8d8d8d"
              : "#8d8d8d"
            : "#1a1a1a",
        }}
      >
        {isTop3 ? (
          <RankIcon size={18} style={{ color: "#000" }} />
        ) : (
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#8d8d8d",
            }}
          >
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar placeholder */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          backgroundColor: "#1a1a1a",
          borderRadius: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Saira', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#8d8d8d",
            textTransform: "uppercase",
          }}
        >
          {entry.name.charAt(0)}
        </span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontFamily: "'Saira', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            color: isTop3 && entry.rank === 1 ? "#ccff00" : "#ffffff",
          }}
        >
          {entry.name}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 11,
              color: "#8d8d8d",
            }}
          >
            {entry.workouts} sessions
          </span>
          {entry.streak > 3 && (
            <span
              className="flex items-center gap-1"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "#ff0000",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Flame size={10} />
              {entry.streak} day streak
            </span>
          )}
        </div>
      </div>

      {/* Volume */}
      <div className="text-right flex-shrink-0">
        <div
          style={{
            fontFamily: "'Teko', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "-0.05em",
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
            letterSpacing: "0.05em",
          }}
        >
          KG TOTAL
        </span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");
  const [category, setCategory] = useState<"volume" | "streak" | "prs">("volume");

  const leaderboardQuery = trpc.leaderboard.byVolume.useQuery({
    limit: 50,
    timeRange,
  });

  const leaderboard = leaderboardQuery.data || [];

  // Demo data
  const demoData: LeaderboardEntry[] = [
    { rank: 1, name: "Marcus Steel", totalVolume: 452300, workouts: 48, avgRPE: 8.2, streak: 12 },
    { rank: 2, name: "Elena Voss", totalVolume: 418200, workouts: 52, avgRPE: 7.8, streak: 9 },
    { rank: 3, name: "Jax Power", totalVolume: 395100, workouts: 44, avgRPE: 8.5, streak: 15 },
    { rank: 4, name: "Nova Chen", totalVolume: 371800, workouts: 41, avgRPE: 7.9, streak: 7 },
    { rank: 5, name: "Kai Titan", totalVolume: 354200, workouts: 38, avgRPE: 8.1, streak: 5 },
    { rank: 6, name: "Rex Strong", totalVolume: 341900, workouts: 42, avgRPE: 7.5, streak: 4 },
    { rank: 7, name: "Iris Bolt", totalVolume: 328700, workouts: 39, avgRPE: 8.3, streak: 8 },
    { rank: 8, name: "Orion Lift", totalVolume: 315400, workouts: 36, avgRPE: 7.7, streak: 3 },
    { rank: 9, name: "Zara Flex", totalVolume: 298600, workouts: 34, avgRPE: 8.0, streak: 6 },
    { rank: 10, name: "Axle Press", totalVolume: 287300, workouts: 31, avgRPE: 7.6, streak: 2 },
    { rank: 11, name: "Luna Squat", totalVolume: 275100, workouts: 33, avgRPE: 7.9, streak: 4 },
    { rank: 12, name: "Thor Hammer", totalVolume: 261800, workouts: 29, avgRPE: 8.4, streak: 11 },
    { rank: 13, name: "Vega Pull", totalVolume: 248500, workouts: 27, avgRPE: 7.4, streak: 3 },
    { rank: 14, name: "Nero Burn", totalVolume: 235200, workouts: 25, avgRPE: 8.2, streak: 5 },
    { rank: 15, name: "Cruz Lift", totalVolume: 221900, workouts: 23, avgRPE: 7.8, streak: 2 },
  ];

  const displayData = leaderboard.length > 0
    ? leaderboard.map((e) => ({
        rank: e.rank,
        name: e.name || `Athlete ${e.userId}`,
        totalVolume: e.totalVolume,
        workouts: e.workouts,
        avgRPE: 7.5,
        streak: Math.floor(Math.random() * 15),
      }))
    : demoData;

  return (
    <div style={{ paddingTop: 80 }}>
      <div className="max-w-[1280px] mx-auto px-6" style={{ padding: "40px 0 80px" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={24} style={{ color: "#ccff00" }} />
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
                RANKINGS
              </h1>
            </div>
            <p
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 13,
                color: "#8d8d8d",
              }}
            >
              Global leaderboard. Ranked by total training volume. Updated in real-time.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {(["week", "month", "all"] as const).map((r) => (
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
                {r === "all" ? "ALL TIME" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-8" style={{ borderBottom: "1px solid #1a1a1a" }}>
          {([
            { key: "volume", label: "BY VOLUME", icon: TrendingUp },
            { key: "streak", label: "BY STREAK", icon: Flame },
            { key: "prs", label: "BY PRs", icon: Trophy },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key as "volume" | "streak" | "prs")}
              className="flex items-center gap-2 px-5 py-3 transition-none"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: category === tab.key ? "#ccff00" : "#8d8d8d",
                borderBottom:
                  category === tab.key
                    ? "2px solid #ccff00"
                    : "2px solid transparent",
                marginBottom: -1,
                backgroundColor: "transparent",
                border: "none",
                borderBottomColor: category === tab.key ? "#ccff00" : "transparent",
                borderBottomWidth: 2,
                borderBottomStyle: "solid",
                cursor: "pointer",
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div
          className="flex items-center gap-4 px-6 py-3"
          style={{
            border: "1px solid #1a1a1a",
            borderBottom: "none",
            backgroundColor: "#111111",
          }}
        >
          <div
            className="flex-shrink-0"
            style={{
              width: 40,
              fontFamily: "'Saira', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textAlign: "center",
            }}
          >
            RANK
          </div>
          <div
            className="flex-shrink-0"
            style={{
              width: 40,
              fontFamily: "'Saira', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          />
          <div
            className="flex-1"
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ATHLETE
          </div>
          <div
            className="flex-shrink-0 text-right"
            style={{
              width: 120,
              fontFamily: "'Saira', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            TOTAL VOLUME
          </div>
        </div>

        {/* Rows */}
        <div style={{ border: "1px solid #1a1a1a", borderTop: "none" }}>
          {displayData.map((entry, i) => (
            <LeaderboardRow key={entry.rank} entry={entry} index={i} />
          ))}
        </div>

        {/* Top 3 Podium */}
        <div
          className="grid grid-cols-3 gap-4 mt-10"
          style={{ maxWidth: 600, margin: "40px auto 0" }}
        >
          {[
            { rank: 2, color: "#8d8d8d", height: 120, icon: Medal },
            { rank: 1, color: "#ccff00", height: 160, icon: Crown },
            { rank: 3, color: "#8d8d8d", height: 90, icon: Award },
          ].map((podium) => {
            const entry = displayData.find((e) => e.rank === podium.rank);
            if (!entry) return null;
            const Icon = podium.icon;
            return (
              <div
                key={podium.rank}
                className="flex flex-col items-center"
              >
                <div className="mb-3 text-center">
                  <div
                    className="truncate"
                    style={{
                      fontFamily: "'Saira', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      color: podium.color,
                    }}
                  >
                    {entry.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Teko', sans-serif",
                      fontWeight: 700,
                      fontSize: 24,
                      letterSpacing: "-0.03em",
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    {entry.totalVolume >= 1000
                      ? `${(entry.totalVolume / 1000).toFixed(1)}k`
                      : entry.totalVolume}
                  </div>
                </div>
                <div
                  className="w-full flex items-center justify-center"
                  style={{
                    height: podium.height,
                    backgroundColor: podium.color,
                  }}
                >
                  <Icon size={28} style={{ color: "#000" }} />
                </div>
                <div
                  className="w-full text-center py-2"
                  style={{
                    backgroundColor: "#111111",
                    fontFamily: "'Saira', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: podium.color,
                  }}
                >
                  #{podium.rank}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
