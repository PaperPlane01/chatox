import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {GlobalBan} from "../common/types";
import {config} from "../env-config";

@Injectable()
export class GlobalBansController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "global.ban.events",
        routingKey: "global.ban.created.#",
        queue: `events_service_global_ban_created_${config.EVENTS_SERVICE_PORT}`
    })
    public async onGlobalBanCreated(globalBan: GlobalBan): Promise<void> {
        await this.websocketEventsPublisher.publishGlobalBanCreated(globalBan);
    }

    @RabbitSubscribe({
        exchange: "global.ban.events",
        routingKey: "global.ban.updated.#",
        queue: `events_service_global_ban_updated_${config.EVENTS_SERVICE_PORT}`
    })
    public async onGlobalBanUpdated(globalBan: GlobalBan): Promise<void> {
        await this.websocketEventsPublisher.publishGlobalBanUpdated(globalBan);
    }
}
