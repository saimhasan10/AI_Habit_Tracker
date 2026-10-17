import { useEffect, useState } from "react";
import {
    AtSign,
    ShieldCheck,
    UserCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { getProfile } from "../services/authService";

const Profile = () => {
    const [ profile, setProfile ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="app-layout">
            <Navbar />

            <main className="page-container">
                <section className="page-header">
                    <p className="eyebrow">PROFILE</p>
                    <h1>Your account.</h1>
                    <p>Manage and view your account information.</p>
                </section>

                <section className="profile-card">
                    <div className="profile-avatar">
                        <UserCircle size={54} />
                    </div>

                    <div className="profile-main">
                        <h2>{profile?.username || "User"}</h2>

                        <div className="profile-detail">
                            <AtSign size={18} />
                            <span>{profile?.email || "No email available"}</span>
                        </div>

                        <div className="profile-detail">
                            <ShieldCheck size={18} />
                            <span>Account active</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;