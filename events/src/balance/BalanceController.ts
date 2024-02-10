import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";
import {BalanceUpdated} from "../common/types/events";

@Injectable()
export class BalanceController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {
    }

    @RabbitSubscribe({
        exchange: "balance.events",
        routingKey: "balance.updated.#",
        queue: `events_service_balance_updated-${config.EVENTS_SERVICE_PORT}`
    })
    public async onBalanceUpdated(balanceUpdated: BalanceUpdated): Promise<void> {
        await this.websocketEventsPublisher.publishBalanceUpdated(balanceUpdated);
    }
}