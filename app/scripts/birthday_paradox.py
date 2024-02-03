"""
Title: Birthday Paradox simulation
Description: The Birthday Paradox, also known as the Birthday Problem, refers to the counter-intuitive probability that in a group of just 23 people, there's a 50% chance that at least two people have the same birthday. Despite there being 365 days in a year, it only takes a group of 23 for there to be a 50-50 chance of a shared birthday, and a group of 70 for there to be a 99.9% chance. This is considered a paradox because it goes against our intuition. This principle is often used in computer science to demonstrate hash collisions, which occur when two different inputs into a hash function produce the same output.
"""
import random
import colorama as color

color.init()


def paradox(number_of_babies: int = 23, runs: int = 10, debug: bool = False) -> float:
    """Run Birthday Paradox simulation."""
    res = []
    for x in range(runs):
        res.append(compare_birthdays(x, runs, make_babies(number_of_babies), debug))
    # calculate possibility
    perc = sum(res) / (len(res) / 100)
    print(f"Die Wahrscheinlichkeit, dass 2 Babies den selben Geburtstag haben, beträgt: {perc}%. "
          f"[{number_of_babies} Babies, {runs} Durchläufe]")
    return perc


def make_babies(number_of_babies: int) -> list:
    """Return a list of n random birthdays"""
    babies = []
    for x in range(number_of_babies):
        babies.append(random.randint(1, 365))
    return babies


def compare_birthdays(run: int, runs: int, babies: list, debug: bool) -> int:
    """Check for duplicates in group of birthdays."""
    out = 0
    dupe = 0
    for x in babies:
        if babies.count(x) > 1:
            dupe = x
            out = 1

    if debug:
        visualize(run, runs, babies, out, dupe)
    return out


def visualize(run: int, runs: int, babies: list, out: int, dupe: int) -> None:
    """Visualize duplicate birthdays as console output."""
    dupe_clr = color.Fore.BLUE
    clr = color.Fore.GREEN
    if not out:
        clr = color.Fore.RED

    rst = color.Style.RESET_ALL

    print(clr + "< Gruppe", format_run(run, runs), ">", end="" + rst)

    for x in range(len(babies)):

        # convert int to date
        date = int_to_date(babies[x])

        if babies[x] == dupe:
            tmp_clr = dupe_clr
        else:
            tmp_clr = clr
        print(tmp_clr + "", date, end="" + rst)
    print()


def int_to_date(int_date: int) -> str:
    """Turn day of year into a date."""
    temp_int_date = int_date
    months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    month = 1

    for x in months:
        if temp_int_date > x:
            month += 1
            temp_int_date -= x
        else:
            day = temp_int_date
            return format_date([day, month])


def format_date(date: list) -> str:
    """Put zeros before day / month if they consist of only one digit."""
    str_date = list(map(str, date))

    for i, x in enumerate(str_date):
        if len(x) == 1:
            str_date[i] = "0" + x

    return "{0}.{1}.".format(*str_date)


def format_run(run: int, runs: int) -> str:
    """Format "runs" int so that it has the same number of digits, no matter the value.
    \n i.e.:
    \n for 100 runs: 1 -> 001
    \n for 1000 runs: 74 -> 0074
    """
    tmp_runs = ""

    for x in range(len(str(run + 1)), len(str(runs))):
        tmp_runs += "0"

    return tmp_runs + str(run + 1)


if __name__ == "__main__":
    # babies = input("How many babies do you want to simulate?: ")
    runs = input("How many runs do you want to do?: ")
    # debug = input("Do you want to see the simulation? (y/n): ")

    percentages = []

    for i in range(int(runs)):
        percentages.append(paradox())
        
    print(sum(percentages) / (len(percentages)))