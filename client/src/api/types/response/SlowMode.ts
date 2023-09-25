import {TimeUnit} from "./TimeUnit";

export interface SlowMode {
    enabled: boolean,
    interval: number,
    unit: TimeUnit
}
