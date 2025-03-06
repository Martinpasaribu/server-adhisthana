
// Helper function untuk generate date range

export const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
    }

    let currentDate = start;

    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
        // Tambah 1 hari
        currentDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24));
    }

    return dates;
};
