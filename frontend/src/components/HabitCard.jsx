import {
    Check,
    Circle,
    Pencil,
    Trash2,
} from "lucide-react";


const isCompletedToday = (habit) => {

    if (
        habit.completed === true ||
        habit.is_completed === true ||
        habit.today_completed === true
    ) {
        return true;
    }


    if (!Array.isArray(habit.completions)) {
        return false;
    }


    const today =
        new Date()
            .toISOString()
            .split("T")[ 0 ];


    return habit.completions.some(
        (completion) =>
            completion.date === today &&
            completion.completed === true
    );
};


const HabitCard = ({
    habit,
    onComplete,
    onEdit,
    onDelete,
}) => {

    const completed =
        isCompletedToday(habit);


    const title =
        habit.title ||
        habit.name ||
        "Untitled Habit";


    const description =
        habit.description ||
        "No description";


    const frequency =
        habit.frequency ||
        "daily";


    return (
        <article
            className={`habit-card ${completed ? "completed" : ""
                }`}
        >

            <div className="habit-card-top">

                <button
                    type="button"
                    className={`complete-button ${completed ? "done" : ""
                        }`}
                    onClick={() =>
                        onComplete(habit.id)
                    }
                    disabled={completed}
                    title={
                        completed
                            ? "Completed today"
                            : "Complete habit"
                    }
                >

                    {completed ? (
                        <Check size={18} />
                    ) : (
                        <Circle size={18} />
                    )}

                </button>


                <div className="habit-content">

                    <h3>
                        {title}
                    </h3>

                    <p>
                        {description}
                    </p>

                    <span className="frequency-tag">
                        {frequency}
                    </span>

                </div>

            </div>


            <div className="habit-actions">

                <button
                    type="button"
                    className="small-action"
                    onClick={() =>
                        onEdit(habit)
                    }
                    title="Edit habit"
                >
                    <Pencil size={16} />
                </button>


                <button
                    type="button"
                    className="small-action danger"
                    onClick={() =>
                        onDelete(habit.id)
                    }
                    title="Delete habit"
                >
                    <Trash2 size={16} />
                </button>

            </div>

        </article>
    );
};


export default HabitCard;