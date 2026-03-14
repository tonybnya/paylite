import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"

import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import UserDashboard from "./pages/dashboard/UserDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import Layout from "./components/layout/Layout"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" richColors />
            <Router>
                <Routes>
                    {/* Public / Landing */}
                    <Route path="/" element={<Home />} />

                    {/* Authentication */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />

                    {/* Unauthorized */}
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected Routes wrapped in Layout */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        {/* User Dashboard */}
                        <Route path="/dashboard/*" element={<UserDashboard />} />

                        {/* Admin Dashboard - Restricted to ADMIN role */}
                        <Route 
                            path="/admin/*" 
                            element={
                                <ProtectedRoute requireAdmin>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } 
                        />
                    </Route>

                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
