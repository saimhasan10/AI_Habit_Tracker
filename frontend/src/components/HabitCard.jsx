import {
    Check,
    Circle,
    Pencil,
    Trash2,
} from "lucide-react";


const HabitCard = ({
    habit,
    onComplete,
    onEdit,
    onDelete,
}) => {

    const completed =
        habit.today_completed === true ||
        habit.completed === true ||
        (
            Array.isArray(habit.completions) &&
            habit.completions.some(
                (item) =>
                    item.date ===
                    new Date()
                        .toISOString()
                        .split("T")[ 0 ] &&
                    item.completed === true
            )
        );


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
                    disabled={completed}
                    onClick={() =>
                        onComplete(habit.id)
                    }
                    title={
                        completed
                            ? "Completed"
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
                        {habit.title}
                    </h3>

                    <p>
                        {habit.description ||
                            "No description"}
                    </p>

                    <span className="frequency-tag">
                        {habit.frequency}
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