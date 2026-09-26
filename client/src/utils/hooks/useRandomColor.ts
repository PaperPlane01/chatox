import randomColor from "randomcolor";
import {useLuminosity, UseLuminosityOptions} from "./useLuminosity";

export const useRandomColor = (seed: string, luminosityOptions?: UseLuminosityOptions): string => {
    const luminosity = useLuminosity(luminosityOptions);
    return randomColor({seed, luminosity});
};
