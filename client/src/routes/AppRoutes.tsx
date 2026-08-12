import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import TasksPage from "../pages/TasksPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}