import {
    useEffect,
    useState,
} from "react";

import {
    CheckCircle2,
    Flame,
    ListChecks,
    Target,
} from "lucide-react";

import Navbar from "../components/Navbar";
import HabitCard from "../components/HabitCard";
import HabitHistory from "../components/HabitHistory";
import Loading from "../components/Loading";

import {
    completeHabit,
    deleteHabit,
    getDashboard,
    getHabitHistory,
    getHabits,
} from "../services/habitService";


const Dashboard = () => {

    const [ habits, setHabits ] =
        useState([]);

    const [ dashboard, setDashboard ] =
        useState({
            total_habits: 0,
            completed_today: 0,
            today_consistency: 0,
            week_consistency: 0,
            month_consistency: 0,
            best_streak: 0,
        });

    const [ dailyHistory, setDailyHistory ] =
        useState([]);

    const [ weeklyHistory, setWeeklyHistory ] =
        useState([]);

    const [ loading, setLoading ] =
        useState(true);


    const loadData = async () => {

        try {

            const [
                habitsData,
                dashboardData,
                historyData,
            ] = await Promise.all([

                getHabits(),

                getDashboard(),

                getHabitHistory("month"),

            ]);


            const habitList =
                Array.isArray(habitsData)
                    ? habitsData
                    : habitsData.results || [];


            setHabits(habitList);


            setDashboard(
                dashboardData.summary || {}
            );


            setDailyHistory(
                historyData.daily_history || []
            );


            setWeeklyHistory(
                historyData.weekly_history || []
            );

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    const handleComplete = async (
        id
    ) => {

        try {

            await completeHabit(id);

            await loadData();

        } catch (error) {

            console.error(
                "Complete error:",
                error
            );

        }
    };


    const handleDelete = async (
        id
    ) => {

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
                "Delete error:",
                error
            );

        }
    };


    const handleEdit = () => {

        window.location.href =
            "/habits";

    };


    if (loading) {
        return <Loading />;
    }


    return (

        <div className="app-layout">

            <Navbar />


            <main className="page-container">


                {/* HEADER */}

                <section className="page-header">

                    <p className="eyebrow">
                        DASHBOARD
                    </p>

                    <h1>
                        Good habits, better days.
                    </h1>

                    <p>
                        See your progress and stay consistent.
                    </p>

                </section>


                {/* SUMMARY */}

                <section className="stats-grid">


                    <div className="stat-card">

                        <span className="stat-icon">
                            <ListChecks size={20} />
                        </span>

                        <div>

                            <span>
                                Total habits
                            </span>

                            <strong>
                                {dashboard.total_habits}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            <CheckCircle2 size={20} />
                        </span>

                        <div>

                            <span>
                                Completed today
                            </span>

                            <strong>
                                {dashboard.completed_today}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            <Target size={20} />
                        </span>

                        <div>

                            <span>
                                This week
                            </span>

                            <strong>
                                {dashboard.week_consistency}%
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <span className="stat-icon">
                            <Flame size={20} />
                        </span>

                        <div>

                            <span>
                                Best streak
                            </span>

                            <strong>
                                {dashboard.best_streak}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* CONSISTENCY */}

                <section className="consistency-section">

                    <div className="consistency-card">

                        <span>
                            Today's consistency
                        </span>

                        <strong>
                            {dashboard.today_consistency}%
                        </strong>

                    </div>


                    <div className="consistency-card">

                        <span>
                            Weekly consistency
                        </span>

                        <strong>
                            {dashboard.week_consistency}%
                        </strong>

                    </div>


                    <div className="consistency-card">

                        <span>
                            Monthly consistency
                        </span>

                        <strong>
                            {dashboard.month_consistency}%
                        </strong>

                    </div>

                </section>


                {/* HABITS */}

                <section className="dashboard-habits">

                    <div className="section-header">

                        <div>

                            <h2>
                                Your habits
                            </h2>

                            <p>
                                Today's habit status.
                            </p>

                        </div>

                    </div>


                    {habits.length === 0 ? (

                        <div className="empty-state">

                            <CheckCircle2 size={38} />

                            <h3>
                                No habits yet
                            </h3>

                            <p>
                                Create your first habit to start tracking.
                            </p>

                        </div>

                    ) : (

                        <div className="habit-grid">

                            {habits.map(
                                (habit) => (

                                    <HabitCard
                                        key={habit.id}
                                        habit={habit}
                                        onComplete={
                                            handleComplete
                                        }
                                        onEdit={handleEdit}
                                        onDelete={
                                            handleDelete
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* HISTORY */}

                <HabitHistory
                    dailyHistory={
                        dailyHistory
                    }
                    weeklyHistory={
                        weeklyHistory
                    }
                />

            </main>

        </div>
    );
};


export default Dashboard;