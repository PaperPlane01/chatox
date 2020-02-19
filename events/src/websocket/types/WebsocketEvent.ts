import {EventType} from "./EventType";

export interface WebsocketEvent<PayloadType> {
    type: EventType,
    payload: PayloadType
}
