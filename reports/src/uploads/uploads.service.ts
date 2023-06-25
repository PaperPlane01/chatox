import {Inject, Injectable, Logger} from "@nestjs/common";
import {AxiosInstance} from "axios";
import {AXIOS_INSTANCE} from "../axios/constants";
import {EurekaService} from "../eureka/eureka.service";

@Injectable()
export class UploadsService {
    private readonly log = new Logger(UploadsService.name);

    constructor(@Inject(AXIOS_INSTANCE) private readonly axiosInstance: AxiosInstance,
                private readonly eurekaService: EurekaService) {
    }

    public async archiveUpload(id: string): Promise<void> {
        const url = this.eurekaService.getUrlForService("uploads-service");

        try {
            await this.axiosInstance(`${url}/api/v1/uploads/${id}/archive`);
        } catch (error) {
            this.log.error(`Error occurred when tried to archive upload with id ${id}`);
            this.log.error(error.trace ? error.trace : error);

            throw error;
        }
    }
}
