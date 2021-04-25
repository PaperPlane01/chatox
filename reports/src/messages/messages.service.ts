import {Inject, Injectable, Logger} from "@nestjs/common";
import {AxiosInstance} from "axios";
import {MessageResponse} from "./types/responses/message.response";
import {MessageNotFoundException} from "./exceptions/message-not-found.exception";
import {AXIOS_INSTANCE} from "../axios/constants";
import {EurekaService} from "../eureka/eureka.service";

@Injectable()
export class MessagesService {
    private readonly log = new Logger(MessagesService.name)
    
    constructor(@Inject(AXIOS_INSTANCE) private readonly axios: AxiosInstance,
                private readonly eurekaService: EurekaService) {
    }
    
    public async findMessageById(id: string): Promise<MessageResponse> {
        const url = this.eurekaService.getUrlForService("chat-service");
        
        try {
            const response = await this.axios.get<MessageResponse>(`${url}/api/v1/messages/${id}`);
            
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new MessageNotFoundException(id);
            }

            this.log.error("Error occurred when tried to fetch message by id");
            this.log.error(error.trace ? error.trace : error);

            throw error;
        }
    }
}
