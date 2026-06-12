import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#050505" }}
    >
      <div className="text-center">
        <div
          style={{
            fontFamily: "'Teko', sans-serif",
            fontWeight: 700,
            fontSize: 160,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            color: "#1a1a1a",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "'Saira', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginTop: -20,
            marginBottom: 12,
          }}
        >
          PAGE NOT FOUND
        </h1>
        <p
          style={{
            fontFamily: "'Saira', sans-serif",
            fontSize: 13,
            color: "#8d8d8d",
            marginBottom: 24,
          }}
        >
          This route does not exist. Back to training.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={14} />
          BACK TO DASHBOARD
        </Link>
      </div>
    </div>
  );
}
