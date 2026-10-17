import { useEffect, useState } from "react";

import {
    CheckCircle2,
    Flame,
    ListChecks,
    TrendingUp,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import HabitCard from "../components/HabitCard";
import Loading from "../components/Loading";

import {
    completeHabit,
    deleteHabit,
    getDashboard,
    getHabits,
} from "../services/habitService";


const Dashboard = () => {

    const navigate = useNavigate();

    const [ habits, setHabits ] = useState([]);
    const [ dashboard, setDashboard ] = useState([]);

    const [ loading, setLoading ] = useState(true);


    const loadData = async () => {

        try {

            const [
                habitData,
                dashboardData,
            ] = await Promise.all([
                getHabits(),
                getDashboard(),
            ]);


            const habitList =
                Array.isArray(habitData)
                    ? habitData
                    : habitData.results ||
                    habitData.habits ||
                    [];


            const dashboardList =
                Array.isArray(dashboardData)
                    ? dashboardData
                    : [];


            setHabits(habitList);
            setDashboard(dashboardList);

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // =========================
    // COMPLETE HABIT
    // =========================

    const handleComplete = async (id) => {

        try {

            await completeHabit(id);

            await loadData();

        } catch (error) {

            console.error(
                "Complete habit error:",
                error
            );

        }
    };


    // =========================
    // EDIT HABIT
    // =========================

    const handleEdit = () => {

        // Dashboard doesn't contain
        // the edit form.
        // Send user to Habits page.

        navigate("/habits");

    };


    // =========================
    // DELETE HABIT
    // =========================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this habit?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteHabit(id);

            await loadData();

        } catch (error) {

            console.error(
                "Delete habit error:",
                error
            );

        }
    };


    if (loading) {
        return <Loading />;
    }


    const totalHabits =
        habits.length;


    const totalStreaks =
        dashboard.reduce(
            (total, item) =>
                total + (item.streak || 0),
            0
        );


    const activeHabits =
        habits.filter(
            (habit) =>
                habit.is_active === true
        ).length;


    const bestStreak =
        dashboard.length > 0
            ? Math.max(
                ...dashboard.map(
                    (item) =>
                        item.streak || 0
                )
            )
            : 0;


    return (

        <div className="app-layout">

            <Navbar />


            <main className="page-container">


                {/* =========================
            HEADER
        ========================= */}

                <section className="page-header">

                    <p className="eyebrow">
                        YOUR PROGRESS
                    </p>

                    <h1>
                        Good habits, better days.
                    </h1>

                    <p>
                        Stay consistent and keep moving forward.
                    </p>

                </section>


                {/* =========================
            STATS
        ========================= */}

                <section className="stats-grid">


                    <div className="stat-card">

                        <span className="stat-icon">
                            <ListChecks size={21} />
                        </span>

                        <div>

                            <span>
                                Total habits
                            </span>

                            <strong>
                                {totalHabits}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            <CheckCircle2 size={21} />
                        </span>

                        <div>

                            <span>
                                Active habits
                            </span>

                            <strong>
                                {activeHabits}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            <TrendingUp size={21} />
                        </span>

                        <div>

                            <span>
                                Total streaks
                            </span>

                            <strong>
                                {totalStreaks}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            <Flame size={21} />
                        </span>

                        <div>

                            <span>
                                Best streak
                            </span>

                            <strong>
                                {bestStreak}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* =========================
            HABITS
        ========================= */}

                <section className="section-header">

                    <div>

                        <h2>
                            Your habits
                        </h2>

                        <p>
                            Keep working on your daily routine.
                        </p>

                    </div>

                </section>


                {habits.length === 0 ? (

                    <div className="empty-state">

                        <CheckCircle2 size={38} />

                        <h3>
                            No habits yet
                        </h3>

                        <p>
                            Create your first habit from the Habits page.
                        </p>

                    </div>

                ) : (

                    <div className="habit-grid">

                        {habits
                            .slice(0, 6)
                            .map((habit) => (

                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onComplete={handleComplete}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />

                            ))}

                    </div>

                )}

            </main>

        </div>

    );
};


export default Dashboard;