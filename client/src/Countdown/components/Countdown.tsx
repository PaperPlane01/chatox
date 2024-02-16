import React, {Fragment, FunctionComponent, PropsWithChildren, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {intervalToDuration, isAfter} from "date-fns";
import {isDefined} from "../../utils/object-utils";

interface CountdownProps extends PropsWithChildren {
    date?: Date
}

const getLabel = (seconds: number, minutes: number, hours: number): string => {
    const hoursLabel = hours !== 0 ? `${hours}:` : "";
    const minutesLabel = minutes < 10 ? `0${minutes}:` : `${minutes}:`;
    const secondsLabel = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${hoursLabel}${minutesLabel}${secondsLabel}`;
};

export const Countdown: FunctionComponent<CountdownProps> = observer(({
    date,
    children
}) => {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = !isDefined(date)
            ? undefined
            : setInterval(() => {
                if (isAfter(new Date(), date)) {
                    setHours(0);
                    setMinutes(0);
                    setSeconds(0);
                } else {
                    const interval = intervalToDuration({
                        start: new Date(),
                        end: date
                    });
                    setHours(interval.hours ?? 0);
                    setMinutes(interval.minutes ?? 0);
                    setSeconds(interval.seconds ?? 0);
                }
            })

        return () => clearInterval(id);
    });

    const completed = hours + minutes + seconds === 0;

    return (
        <Fragment>
            {completed || !isDefined(date)
                ? children
                : (
                    <Typography color="textSecondary">
                        {getLabel(seconds, minutes, hours)}
                    </Typography>
                )
            }
        </Fragment>
    );
});
