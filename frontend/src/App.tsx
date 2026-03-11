import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import UserDashboard from "./pages/dashboard/UserDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import NotFound from "./pages/NotFound"
import Layout from "./components/layout/Layout"

function App() {
    return (
        <Router>
            <Routes>
                {/* Public / Landing */}
                <Route path="/" element={<Home />} />

                {/* Authentication */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* Protected Routes wrapped in Layout */}
                <Route element={<Layout />}>
                    {/* User Dashboard */}
                    <Route path="/dashboard/*" element={<UserDashboard />} />

                    {/* Admin Dashboard */}
                    <Route path="/admin/*" element={<AdminDashboard />} />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
}

export default App
