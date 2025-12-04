import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Admin from "./Admin";

export default function App() {
  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Lager Utlånssystem</h1>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
