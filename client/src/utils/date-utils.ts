import {addDays, addHours, addMinutes, addMonths, addSeconds, addWeeks, addYears} from "date-fns";
import {TimeUnit} from "../api/types/response";

export class Duration {
    public readonly unit: TimeUnit;
    public readonly value: number;

    private constructor(source: Omit<Duration, "addToDate">) {
        this.unit = source.unit;
        this.value = source.value;
    }

    public addToDate(date: Date): Date {
        switch (this.unit) {
            case TimeUnit.SECONDS:
                return addSeconds(date, this.value);
            case TimeUnit.MINUTES:
                return addMinutes(date, this.value);
            case TimeUnit.HOURS:
                return addHours(date, this.value);
            case TimeUnit.DAYS:
                return addDays(date, this.value);
            case TimeUnit.WEEKS:
                return addWeeks(date, this.value);
            case TimeUnit.MONTHS:
                return addMonths(date, this.value);
            case TimeUnit.YEARS:
            default:
                return addYears(date, this.value);
        }
    }

    public static of(value: number, unit: TimeUnit): Duration {
        return new Duration({value, unit});
    }
}

export const getDate = (date: Date | string): Date => {
    if (typeof date === "string") {
        return new Date(date);
    } else {
        return date;
    }
};
