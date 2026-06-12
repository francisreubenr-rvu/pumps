import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { Zap, User, Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const { isLoggedIn, getOAuthUrl } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("local_auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (isLoggedIn) {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      if (!username || !password) {
        setError("Please fill in all fields");
        return;
      }
      loginMutation.mutate({ username, password });
    } else {
      if (!username || !displayName || !password) {
        setError("Please fill in all required fields");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      registerMutation.mutate({
        username,
        displayName,
        email: email || undefined,
        password,
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#050505" }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            style={{
              fontFamily: "'Saira', sans-serif",
              fontWeight: 900,
              fontSize: 36,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              color: "#ccff00",
              marginBottom: 8,
            }}
          >
            KINETIC
          </h1>
          <p
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 12,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            TRACK. COMPETE. DOMINATE.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8" style={{ borderBottom: "1px solid #1a1a1a" }}>
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setMode(tab);
                setError("");
              }}
              className="flex-1 py-3 transition-none"
              style={{
                fontFamily: "'Saira', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: mode === tab ? "#ccff00" : "#8d8d8d",
                borderBottom:
                  mode === tab ? "2px solid #ccff00" : "2px solid transparent",
                marginBottom: -1,
                backgroundColor: "transparent",
                border: "none",
                borderBottomColor: mode === tab ? "#ccff00" : "transparent",
                borderBottomWidth: 2,
                borderBottomStyle: "solid",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              className="px-4 py-3"
              style={{
                backgroundColor: "rgba(255,0,0,0.1)",
                border: "1px solid rgba(255,0,0,0.3)",
                fontFamily: "'Saira', sans-serif",
                fontSize: 12,
                color: "#ff0000",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "#8d8d8d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              <User size={10} className="inline mr-1" />
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="your_username"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Your Display Name"
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: "'Saira', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8d8d8d",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  <Mail size={10} className="inline mr-1" />
                  EMAIL (OPTIONAL)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
            </>
          )}

          <div>
            <label
              style={{
                fontFamily: "'Saira', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "#8d8d8d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              <Lock size={10} className="inline mr-1" />
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? (
              "PROCESSING..."
            ) : (
              <>
                {mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px" style={{ backgroundColor: "#1a1a1a" }} />
          <span
            style={{
              fontFamily: "'Saira', sans-serif",
              fontSize: 10,
              color: "#8d8d8d",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            OR
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#1a1a1a" }} />
        </div>

        {/* OAuth */}
        <a
          href={getOAuthUrl()}
          className="btn-outline w-full flex items-center justify-center gap-2"
        >
          <Zap size={14} />
          LOGIN WITH OAUTH
        </a>

        {/* Footer */}
        <p
          className="text-center mt-8"
          style={{
            fontFamily: "'Saira', sans-serif",
            fontSize: 11,
            color: "#8d8d8d",
            letterSpacing: "0.02em",
          }}
        >
          No account? Training data is yours. Always.
        </p>
      </div>
    </div>
  );
}
