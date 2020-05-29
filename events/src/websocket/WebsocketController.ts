import {Controller, Get, Param} from "@nestjs/common";
import {WebsocketEventsPublisher} from "./WebsocketEventsPublisher";
import {SessionActivityStatusResponse} from "./types/SessionActivityStatusResponse";

@Controller("api/v1/sessions")
export class WebsocketController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @Get(":socketIoId")
    public isSessionActive(@Param() socketIoId: string): SessionActivityStatusResponse {
        return this.websocketEventsPublisher.isSessionActive(socketIoId);
    }

    @Get("user/:userId")
    public getSessionsOfUser(@Param() userId: string): string[] {
        return this.websocketEventsPublisher.getSessionsOfUser(userId);
    }
}
