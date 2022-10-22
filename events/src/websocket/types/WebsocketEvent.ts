import {EventType} from "./EventType";

export interface WebsocketEvent<PayloadType = any> {
    type: EventType,
    payload: PayloadType
}
