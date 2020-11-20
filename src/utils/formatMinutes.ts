/**
 * Transform minutes to a hour/minute formatted string
 * ex. 130 min = 2 hour and 10 minutes
 * @param mins Minutes
 * @returns A human formatted string
 */
const formatMinutes = (mins: number): string => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    let string = '';
    if (hours > 0) {
        string += hours;
        if (hours === 1) string += ' ora';
        else string += ' ore';
    }
    if (minutes > 0) {
        if (hours > 0) string += ' e ';
        string += minutes + ' minuti';
    }
    return string;
};

export default formatMinutes;
