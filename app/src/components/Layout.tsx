import { Link, useLocation, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, Trophy, BarChart3, TrendingUp, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Layout() {
  const { user, isLoggedIn, logout, getOAuthUrl } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/", label: "DASHBOARD", icon: BarChart3 },
    { path: "/log", label: "LOG", icon: Dumbbell },
    { path: "/compete", label: "COMPETE", icon: Trophy },
    { path: "/leaderboard", label: "RANKS", icon: TrendingUp },
    { path: "/progress", label: "PROGRESS", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 60,
          backgroundColor: scrolled ? "rgba(5,5,5,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between px-6">
          <Link
            to="/"
            className="text-white font-bold tracking-tighter"
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 18,
              letterSpacing: "-0.04em",
            }}
          >
            KINETIC
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 transition-none"
                style={{
                  fontFamily: "'Saira', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: location.pathname === link.path ? "#ccff00" : "#8d8d8d",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 12,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-[#1a1a1a] transition-none"
                  style={{ color: "#8d8d8d" }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <a
                href={getOAuthUrl()}
                className="btn-primary"
              >
                LOGIN
              </a>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: "#fff" }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: "rgba(5,5,5,0.98)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: location.pathname === link.path ? "#ccff00" : "#ffffff",
              }}
            >
              <link.icon size={24} />
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="flex items-center gap-3"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#ff0000",
              }}
            >
              <LogOut size={24} />
              LOGOUT
            </button>
          ) : (
            <a
              href={getOAuthUrl()}
              className="btn-primary"
              style={{ fontSize: 18, padding: "16px 32px" }}
            >
              LOGIN
            </a>
          )}
        </div>
      )}

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
