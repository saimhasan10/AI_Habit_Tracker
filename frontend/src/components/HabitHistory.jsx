import {
    CalendarDays,
    Check,
} from "lucide-react";


const formatDate = (value) => {

    const date = new Date(
        `${value}T00:00:00`
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


const formatWeek = (
    start,
    end
) => {

    return `${formatDate(start)} - ${formatDate(end)}`;
};


const HabitHistory = ({
    dailyHistory = [],
    weeklyHistory = [],
}) => {

    return (

        <section className="history-section">

            <div className="history-title">

                <CalendarDays size={20} />

                <h2>
                    Progress history
                </h2>

            </div>


            {dailyHistory.length > 0 && (

                <div className="history-block">

                    <h3>
                        Daily habits
                    </h3>

                    <div className="history-grid">

                        {dailyHistory.map(
                            (day) => (

                                <div
                                    className="history-day"
                                    key={day.date}
                                >

                                    <strong>
                                        {formatDate(day.date)}
                                    </strong>

                                    <span>
                                        {day.completed_count}/
                                        {day.total_habits}
                                    </span>


                                    <div className="history-habits">

                                        {day.habits.map(
                                            (habit) => (

                                                <div
                                                    className="history-habit"
                                                    key={habit.habit_id}
                                                >

                                                    <span
                                                        className={
                                                            habit.completed
                                                                ? "history-check completed"
                                                                : "history-check"
                                                        }
                                                    >

                                                        {habit.completed && (
                                                            <Check size={12} />
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

                            )
                        )}

                    </div>

                </div>

            )}


            {weeklyHistory.length > 0 && (

                <div className="history-block">

                    <h3>
                        Weekly habits
                    </h3>

                    <div className="weekly-history-list">

                        {weeklyHistory.map(
                            (week) => (

                                <div
                                    className="weekly-history-card"
                                    key={`${week.week_start}-${week.week_end}`}
                                >

                                    <div>

                                        <strong>
                                            {formatWeek(
                                                week.week_start,
                                                week.week_end
                                            )}
                                        </strong>

                                        <span>
                                            {week.completed_count}/
                                            {week.total_habits}
                                            {" "}completed
                                        </span>

                                    </div>


                                    <div className="weekly-habit-list">

                                        {week.habits.map(
                                            (habit) => (

                                                <div
                                                    className="history-habit"
                                                    key={habit.habit_id}
                                                >

                                                    <span
                                                        className={
                                                            habit.completed
                                                                ? "history-check completed"
                                                                : "history-check"
                                                        }
                                                    >

                                                        {habit.completed && (
                                                            <Check size={12} />
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

                            )
                        )}

                    </div>

                </div>

            )}


            {dailyHistory.length === 0 &&
                weeklyHistory.length === 0 && (

                    <p className="history-empty">
                        No progress history available yet.
                    </p>

                )}

        </section>
    );
};


export default HabitHistory;