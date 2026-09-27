from datetime import date, timedelta


def calculate_streak(completions):

    dates = sorted(
        [
            completion.date
            for completion in completions
        ],
        reverse=True
    )


    if not dates:
        return 0


    streak = 1

    current_date = dates[0]


    for completion_date in dates[1:]:

        if completion_date == current_date - timedelta(days=1):

            streak += 1

            current_date = completion_date

        else:

            break


    return streak