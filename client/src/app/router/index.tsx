import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../../pages/auth/login.page";
import { DashboardPage } from "../../pages/dashboard/dashboard.page";
import { ProtectedRoute } from "./protected-route";

export function AppRouter() {
  return <BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route path="/app" element={<DashboardPage />} /></Route><Route path="*" element={<Navigate replace to="/login" />} /></Routes></BrowserRouter>;
}