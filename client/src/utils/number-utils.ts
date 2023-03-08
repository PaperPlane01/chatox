import {isDefined} from "./object-utils";

interface Bound {
    value?: number,
    mode: "inclusive" | "exclusive"
}

interface IsBetweenOptions {
    lowerBound: Bound,
    upperBound: Bound
}

export const isBetween = (number: number, bounds: IsBetweenOptions): boolean => {
    const {lowerBound, upperBound} = bounds;

    if (!isDefined(lowerBound.value) && !isDefined(upperBound.value)) {
        return true;
    }

    const satisfiesLowerBound = isDefined(lowerBound.value)
        ? lowerBound.mode === "inclusive" ? number >= lowerBound.value! : number > lowerBound.value!
        : true;
    const satisfiesUpperBound = isDefined(upperBound.value)
        ? upperBound.mode === "inclusive" ? number <= upperBound.value! : number < upperBound.value!
        : true;

    return satisfiesLowerBound && satisfiesUpperBound;
}