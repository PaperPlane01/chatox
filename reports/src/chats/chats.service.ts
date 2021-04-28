import {Inject, Injectable, Logger} from "@nestjs/common";
import {AxiosInstance} from "axios";
import {ChatResponse} from "./types/responses/chat.response";
import {ChatNotFoundException} from "./exceptions/chat-not-found.exception";
import {AXIOS_INSTANCE} from "../axios/constants";
import {EurekaService} from "../eureka/eureka.service";

@Injectable()
export class ChatsService {
    private readonly log = new Logger(ChatsService.name);

    constructor(@Inject(AXIOS_INSTANCE) private readonly axios: AxiosInstance,
                private readonly eurekaService: EurekaService) {
    }

    public async findChatById(chatId: string): Promise<ChatResponse> {
        const baseUrl = this.eurekaService.getUrlForService("chat-service");

        try {
            const response = await this.axios.get<ChatResponse>(`${baseUrl}/api/v1/chats/${chatId}`);

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new ChatNotFoundException(chatId);
            }

            this.log.error("Error occurred when tried to fetch chat by id");
            this.log.error(error.trace ? error.trace : error);

            throw error;
        }
    }
}
