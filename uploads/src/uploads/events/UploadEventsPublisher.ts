import {Injectable} from "@nestjs/common";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {UploadDeleted} from "../types/events";

@Injectable()
export class UploadEventsPublisher {
    constructor(private readonly amqpConnection: AmqpConnection) {
    }

    public async uploadDeleted(event: UploadDeleted): Promise<void> {
        await this.amqpConnection.publish(
            "upload.events",
            "upload.deleted.#",
            event
        );
    }
}