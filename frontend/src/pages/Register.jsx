import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CheckCircle2,
    LockKeyhole,
    Mail,
    UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [ form, setForm ] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [ error, setError ] = useState("");
    const [ success, setSuccess ] = useState("");
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
        setSuccess("");
        setLoading(true);

        try {
            await register(form);

            setSuccess("Account created successfully.");

            setTimeout(() => {
                navigate("/login");
            }, 700);
        } catch (err) {
            const data = err.response?.data;

            if (typeof data === "string") {
                setError(data);
            } else if (data) {
                setError(
                    Object.values(data)
                        .flat()
                        .join(" ")
                );
            } else {
                setError("Registration failed. Please try again.");
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
                    <h2>Create your account</h2>
                    <p>Start building better habits today.</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <label>
                        Username
                        <div className="input-wrapper">
                            <UserRound size={18} />
                            <input
                                name="username"
                                type="text"
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </label>

                    <label>
                        Email
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
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
                                placeholder="Create a password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </label>

                    <button className="primary-button full" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    );
};

export default Register;