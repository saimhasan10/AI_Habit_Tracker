import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [ form, setForm ] = useState({
        username: "",
        password: "",
    });

    const [ error, setError ] = useState("");
    const [ loading, setLoading ] = useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [ event.target.name ]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(form);
            navigate("/dashboard");
        } catch (err) {
            const data = err.response?.data;

            if (typeof data === "string") {
                setError(data);
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError("Invalid username or password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-brand">
                    <span className="brand-icon large">
                        <CheckCircle2 size={28} />
                    </span>

                    <h1>HabitFlow</h1>
                </div>

                <div className="auth-heading">
                    <h2>Welcome back</h2>
                    <p>Continue building better habits.</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <label>
                        Username
                        <div className="input-wrapper">
                            <UserRound size={18} />
                            <input
                                name="username"
                                type="text"
                                placeholder="Enter your username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </label>

                    <label>
                        Password
                        <div className="input-wrapper">
                            <LockKeyhole size={18} />
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </label>

                    <button className="primary-button full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                </p>
            </section>
        </main>
    );
};

export default Login;