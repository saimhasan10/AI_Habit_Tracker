import {
    useEffect,
    useState,
} from "react";

import {
    Plus,
    X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import HabitCard from "../components/HabitCard";
import Loading from "../components/Loading";

import {
    completeHabit,
    createHabit,
    deleteHabit,
    getHabits,
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

    const [ error, setError ] =
        useState("");


    const loadHabits = async () => {

        try {

            const data =
                await getHabits();

            setHabits(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );

        } catch (error) {

            console.error(error);

            setError(
                "Could not load habits."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadHabits();

    }, []);


    const openCreate = () => {

        setEditingId(null);

        setForm(initialForm);

        setError("");

        setShowForm(true);

    };


    const openEdit = (
        habit
    ) => {

        setEditingId(
            habit.id
        );

        setForm({
            title:
                habit.title || "",
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

        setSaving(true);

        setError("");


        try {

            if (editingId) {

                await updateHabit(
                    editingId,
                    form
                );

            } else {

                await createHabit(
                    form
                );

            }


            setForm(initialForm);

            setEditingId(null);

            setShowForm(false);

            await loadHabits();

        } catch (error) {

            console.error(error);

            setError(
                "Could not save habit."
            );

        } finally {

            setSaving(false);

        }
    };


    const handleComplete = async (
        id
    ) => {

        try {

            await completeHabit(id);

            await loadHabits();

        } catch (error) {

            console.error(error);

            setError(
                "Could not complete habit."
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

            await loadHabits();

        } catch (error) {

            console.error(error);

            setError(
                "Could not delete habit."
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
                            Create and manage your habits.
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

                            </div>


                            <button
                                type="button"
                                className="icon-button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >

                                <X size={18} />

                            </button>

                        </div>


                        <form
                            className="habit-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <label>

                                Habit name

                                <input
                                    name="title"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Exercise"
                                    required
                                />

                            </label>


                            <label>

                                Description

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe your habit"
                                    rows="3"
                                />

                            </label>


                            <label>

                                Frequency

                                <select
                                    name="frequency"
                                    value={
                                        form.frequency
                                    }
                                    onChange={
                                        handleChange
                                    }
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

                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update habit"
                                        : "Create habit"}

                            </button>

                        </form>

                    </div>

                )}


                <section>

                    <div className="section-header">

                        <div>

                            <h2>
                                Your habits
                            </h2>

                            <p>
                                Complete your habits from here.
                            </p>

                        </div>

                    </div>


                    {habits.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No habits yet
                            </h3>

                            <p>
                                Create your first habit.
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
                                        onEdit={
                                            openEdit
                                        }
                                        onDelete={
                                            handleDelete
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};


export default Habits;