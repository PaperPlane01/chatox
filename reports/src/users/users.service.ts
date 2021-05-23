import {Inject, Injectable, Logger} from "@nestjs/common";
import {AxiosInstance} from "axios";
import {UserResponse} from "./types/responses/user.response";
import {UserNotFoundException} from "./exceptions/user-not-found.exception";
import {AXIOS_INSTANCE} from "../axios/constants";
import {EurekaService} from "../eureka/eureka.service";

@Injectable()
export class UsersService {
    private readonly log = new Logger(UsersService.name);

    constructor(@Inject(AXIOS_INSTANCE) private readonly axios: AxiosInstance,
                private readonly eurekaService: EurekaService) {
    }

    public async findUserById(id: string): Promise<UserResponse> {
        try {
            const url = this.eurekaService.getUrlForService("user-service");

            const response = await this.axios.get<UserResponse>(`${url}/api/v1/users/${id}`);

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new UserNotFoundException(id);
            }

            this.log.error("Error occurred when tried to fetch user by id");
            this.log.error(error.trace ? error.trace : error);

            throw error;
        }
    }
}
