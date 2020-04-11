import {WebsocketEventType} from "./WebsocketEventType";

export interface WebsocketEvent<P> {
    type: WebsocketEventType,
    payload: P
}
