import { useEffect, useState } from "react";

import {
    CheckCircle2,
    Plus,
    X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import HabitCard from "../components/HabitCard";
import HabitHistory from "../components/HabitHistory";
import Loading from "../components/Loading";

import {
    completeHabit,
    createHabit,
    deleteHabit,
    getHabits,
    getHabitHistory,
    updateHabit,
} from "../services/habitService";


const initialForm = {
    title: "",
    description: "",
    frequency: "daily",
};


const Habits = () => {

    const [ habits, setHabits ] =
        useState([]);

    const [ history, setHistory ] =
        useState([]);

    const [ historyPeriod, setHistoryPeriod ] =
        useState("week");

    const [ form, setForm ] =
        useState(initialForm);

    const [ editingId, setEditingId ] =
        useState(null);

    const [ showForm, setShowForm ] =
        useState(false);

    const [ loading, setLoading ] =
        useState(true);

    const [ saving, setSaving ] =
        useState(false);

    const [ historyLoading, setHistoryLoading ] =
        useState(false);

    const [ error, setError ] =
        useState("");


    const loadHabits = async () => {

        try {

            const data =
                await getHabits();

            setHabits(
                Array.isArray(data)
                    ? data
                    : data.results ||
                    data.habits ||
                    []
            );

        } catch (err) {

            console.error(err);

            setError(
                "Could not load habits."
            );

        } finally {

            setLoading(false);

        }
    };


    const loadHistory = async (
        period = historyPeriod
    ) => {

        try {

            setHistoryLoading(true);

            const data =
                await getHabitHistory(
                    period
                );

            setHistory(
                data.history || []
            );

        } catch (err) {

            console.error(err);

            setError(
                "Could not load habit history."
            );

        } finally {

            setHistoryLoading(false);

        }
    };


    useEffect(() => {

        loadHabits();
        loadHistory("week");

    }, []);


    const handleHistoryChange = async (
        period
    ) => {

        setHistoryPeriod(period);

        await loadHistory(period);
    };


    const openCreate = () => {

        setEditingId(null);
        setForm(initialForm);
        setError("");
        setShowForm(true);

    };


    const openEdit = (habit) => {

        setEditingId(habit.id);

        setForm({
            title: habit.title || "",
            description:
                habit.description || "",
            frequency:
                habit.frequency || "daily",
        });

        setError("");
        setShowForm(true);

    };


    const handleChange = (
        event
    ) => {

        setForm({
            ...form,
            [ event.target.name ]:
                event.target.value,
        });

    };


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSaving(true);


        try {

            if (editingId) {

                await updateHabit(
                    editingId,
                    form
                );

            } else {

                await createHabit(form);

            }


            setForm(initialForm);
            setEditingId(null);
            setShowForm(false);


            await loadHabits();
            await loadHistory(
                historyPeriod
            );

        } catch (err) {

            console.error(err);

            const data =
                err.response?.data;


            if (data) {

                if (
                    typeof data === "string"
                ) {

                    setError(data);

                } else {

                    setError(
                        Object.values(data)
                            .flat()
                            .join(" ")
                    );

                }

            } else {

                setError(
                    "Could not save habit."
                );

            }

        } finally {

            setSaving(false);

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

            await loadHabits();
            await loadHistory(
                historyPeriod
            );

        } catch (err) {

            console.error(err);

            setError(
                "Could not delete habit."
            );

        }
    };


    const handleComplete = async (
        id
    ) => {

        try {

            await completeHabit(id);

            await loadHabits();
            await loadHistory(
                historyPeriod
            );

        } catch (err) {

            console.error(err);

            setError(
                "Could not complete habit."
            );

        }
    };


    if (loading) {
        return <Loading />;
    }


    return (

        <div className="app-layout">

            <Navbar />


            <main className="page-container">


                <section className="page-header page-header-row">

                    <div>

                        <p className="eyebrow">
                            HABITS
                        </p>

                        <h1>
                            Build your routine.
                        </h1>

                        <p>
                            Small actions become meaningful progress.
                        </p>

                    </div>


                    <button
                        className="primary-button"
                        onClick={openCreate}
                    >

                        <Plus size={18} />

                        New habit

                    </button>

                </section>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {showForm && (

                    <div className="form-card">

                        <div className="form-card-header">

                            <div>

                                <h2>
                                    {editingId
                                        ? "Edit habit"
                                        : "Create habit"}
                                </h2>

                                <p>
                                    Keep it simple and achievable.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => {
                                    setShowForm(false);
                                    setError("");
                                }}
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="habit-form"
                        >

                            <label>

                                Habit name

                                <input
                                    name="title"
                                    type="text"
                                    placeholder="e.g. Read for 20 minutes"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />

                            </label>


                            <label>

                                Description

                                <textarea
                                    name="description"
                                    placeholder="What do you want to achieve?"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                />

                            </label>


                            <label>

                                Frequency

                                <select
                                    name="frequency"
                                    value={form.frequency}
                                    onChange={handleChange}
                                >

                                    <option value="daily">
                                        Daily
                                    </option>

                                    <option value="weekly">
                                        Weekly
                                    </option>

                                </select>

                            </label>


                            <button
                                className="primary-button"
                                disabled={saving}
                            >

                                <CheckCircle2 size={18} />

                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update habit"
                                        : "Create habit"}

                            </button>

                        </form>

                    </div>

                )}


                {/* =========================
            HABIT LIST
        ========================= */}

                <section>

                    <div className="section-header">

                        <div>

                            <h2>
                                Your habits
                            </h2>

                            <p>
                                Complete your habits every day.
                            </p>

                        </div>

                    </div>


                    {habits.length === 0 ? (

                        <div className="empty-state">

                            <CheckCircle2 size={38} />

                            <h3>
                                Your habit list is empty
                            </h3>

                            <p>
                                Add one small habit to get started.
                            </p>

                            <button
                                className="primary-button"
                                onClick={openCreate}
                            >

                                <Plus size={18} />

                                Create first habit

                            </button>

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
                                        onEdit={openEdit}
                                        onDelete={
                                            handleDelete
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =========================
            HISTORY
        ========================= */}

                <section className="history-wrapper">

                    <div className="history-tabs">

                        <button
                            className={
                                historyPeriod === "week"
                                    ? "history-tab active"
                                    : "history-tab"
                            }
                            onClick={() =>
                                handleHistoryChange(
                                    "week"
                                )
                            }
                        >
                            This Week
                        </button>


                        <button
                            className={
                                historyPeriod === "month"
                                    ? "history-tab active"
                                    : "history-tab"
                            }
                            onClick={() =>
                                handleHistoryChange(
                                    "month"
                                )
                            }
                        >
                            This Month
                        </button>

                    </div>


                    {historyLoading ? (

                        <div className="history-loading">
                            Loading history...
                        </div>

                    ) : (

                        <HabitHistory
                            history={history}
                            period={historyPeriod}
                        />

                    )}

                </section>

            </main>

        </div>
    );
};


export default Habits;