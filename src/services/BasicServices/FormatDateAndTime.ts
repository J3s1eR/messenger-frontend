
const FormatDateAndTime = {
    /**
     * Formats the time in "HH:mm" format.
     * @param date - The date object to format.
     * @returns A string representing the time in "HH:mm" format.
     */
    formatTime_HourAndMinute(date: Date): string {
        if (!(date instanceof Date)) {
            console.error('Invalid date provided:', date);
            return '--:--';
        }

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    
    /**
    * Formats the full date and time in a human-readable format.
    * @param date - The date object to format.
    * @returns A string representing the full date and time.
    */
    formatDate_FullDate(date: Date, locale: string = 'ru-RU'): string {//'en-US'
        if (!(date instanceof Date)) {
            console.error('Invalid date provided:', date);
            return 'Invalid date';
        }

        return date.toLocaleString(locale); // Полный формат даты // Локализованная дата
    },

    /**
     * Formats the date in "DD.MM.YYYY" format.
     * @param date - The date object to format.
     * @returns A string representing the date in "DD.MM.YYYY" format.
     */
    formatDate_OnlyDate(date: Date): string {
        if (!(date instanceof Date)) {
            console.error('Invalid date provided:', date);
            return '--.--.----';
        }
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы начинаются с 0
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    },
};

export default FormatDateAndTime;
