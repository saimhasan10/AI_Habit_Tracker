import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    LayoutDashboard,
    ListChecks,
    LogOut,
    MessageCircle,
    UserCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <Link to="/dashboard" className="brand">
                <span className="brand-icon">
                    <CheckCircle2 size={21} />
                </span>

                <span>HabitFlow</span>
            </Link>

            <nav className="nav-links">
                <NavLink to="/dashboard" className="nav-link">
                    <LayoutDashboard size={18} />
                    Dashboard
                </NavLink>

                <NavLink to="/habits" className="nav-link">
                    <ListChecks size={18} />
                    Habits
                </NavLink>

                <NavLink to="/ai" className="nav-link">
                    <MessageCircle size={18} />
                    AI Assistant
                </NavLink>

                <NavLink to="/profile" className="nav-link">
                    <UserCircle size={18} />
                    Profile
                </NavLink>
            </nav>

            <div className="nav-user">
                <span>{user?.username || "User"}</span>

                <button className="icon-button" onClick={handleLogout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;