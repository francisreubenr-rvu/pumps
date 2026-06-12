import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import LogWorkout from "./pages/LogWorkout";
import Competitions from "./pages/Competitions";
import Leaderboard from "./pages/Leaderboard";
import Progress from "./pages/Progress";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/log" element={<LogWorkout />} />
        <Route path="/compete" element={<Competitions />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
