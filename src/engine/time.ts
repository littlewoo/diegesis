
export const TICKS_PER_MINUTE = 1;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const TICKS_PER_DAY = TICKS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

// Start time: Day 1, 08:00 AM
export const START_TIME_OFFSET = 8 * MINUTES_PER_HOUR;

export interface TimeData {
    day: number;
    hour: number;
    minute: number;
    phase: 'morning' | 'day' | 'evening' | 'night';
}

export function getTimeData(totalTicks: number): TimeData {
    const adjustedTicks = totalTicks + START_TIME_OFFSET;
    const day = Math.floor(adjustedTicks / TICKS_PER_DAY) + 1;
    const ticksToday = adjustedTicks % TICKS_PER_DAY;
    const hour = Math.floor(ticksToday / MINUTES_PER_HOUR);
    const minute = ticksToday % MINUTES_PER_HOUR;

    let phase: TimeData['phase'] = 'night';
    if (hour >= 5 && hour < 12) phase = 'morning';
    else if (hour >= 12 && hour < 17) phase = 'day';
    else if (hour >= 17 && hour < 21) phase = 'evening';

    return { day, hour, minute, phase };
}

export function formatTime(timeData: TimeData): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `Day ${timeData.day}, ${pad(timeData.hour)}:${pad(timeData.minute)}`;
}
