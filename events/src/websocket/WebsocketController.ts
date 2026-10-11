import {Controller, Get, Param} from "@nestjs/common";
import {WebsocketEventsPublisher} from "./WebsocketEventsPublisher";
import {SessionActivityStatusResponse} from "./types/SessionActivityStatusResponse";

@Controller("api/v1/sessions")
export class WebsocketController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @Get(":socketIoId")
    public isSessionActive(@Param("socketIoId") socketIoId: string): SessionActivityStatusResponse {
        return this.websocketEventsPublisher.isSessionActive(socketIoId);
    }

    @Get("user/:userId")
    public async getSessionsOfUser(@Param("userId") userId: string): Promise<string[]> {
        return await this.websocketEventsPublisher.getSessionsOfUser(userId);
    }
}
