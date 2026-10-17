import {
    Check,
    CalendarDays,
} from "lucide-react";


const formatDate = (dateString) => {

    const date = new Date(
        `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "short",
            month: "short",
            day: "numeric",
        }
    );
};


const HabitHistory = ({
    history,
    period,
}) => {

    if (!history?.length) {
        return null;
    }


    const totalCompleted =
        history.reduce(
            (total, day) =>
                total + day.completed_count,
            0
        );


    const totalPossible =
        history.reduce(
            (total, day) =>
                total + day.total_habits,
            0
        );


    const percentage =
        totalPossible > 0
            ? Math.round(
                (totalCompleted /
                    totalPossible) *
                100
            )
            : 0;


    return (
        <section className="history-section">

            <div className="history-header">

                <div>

                    <div className="history-title">

                        <CalendarDays size={20} />

                        <h2>
                            {period === "month"
                                ? "Monthly history"
                                : "Weekly history"}
                        </h2>

                    </div>

                    <p>
                        Track your consistency over time.
                    </p>

                </div>


                <div className="history-summary">

                    <strong>
                        {percentage}%
                    </strong>

                    <span>
                        consistency
                    </span>

                </div>

            </div>


            <div className="history-grid">

                {history.map((day) => (

                    <div
                        key={day.date}
                        className="history-day"
                    >

                        <div className="history-day-header">

                            <span>
                                {formatDate(day.date)}
                            </span>

                            <strong>
                                {day.completed_count}/
                                {day.total_habits}
                            </strong>

                        </div>


                        <div className="history-habits">

                            {day.habits.map(
                                (habit) => (

                                    <div
                                        key={habit.habit_id}
                                        className="history-habit"
                                    >

                                        <span
                                            className={
                                                habit.completed
                                                    ? "history-check completed"
                                                    : "history-check"
                                            }
                                        >

                                            {habit.completed && (
                                                <Check size={13} />
                                            )}

                                        </span>

                                        <span>
                                            {habit.habit_title}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
};


export default HabitHistory;