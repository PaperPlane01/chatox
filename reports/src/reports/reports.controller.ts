import {Body, Controller, Post, Query, ParseBoolPipe, Get} from "@nestjs/common";
import {ReportsService} from "./reports.service";
import {CreateReportRequest} from "./types/requests/create-report.request";
import {OptionalAuthorization} from "../auth/decorators/optional-authorization.decorator";
import {RequestIp} from "../auth/decorators/request-ip.decorator";
import {CurrentUser} from "../auth/decorators/current-user.decorator";
import {HasRole} from "../auth/decorators/has-role.decorator";
import {User} from "../auth/types/user";
import {PaginationRequest} from "../utils/pagination/types/requests";

@Controller("reports")
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {
    }
    
    @Post()
    @OptionalAuthorization
    public createReport(@Body() createReportRequest: CreateReportRequest,
                        @RequestIp() ipAddress: string,
                        @CurrentUser() currentUser?: User) {
        return this.reportsService.createReport(createReportRequest, ipAddress, currentUser);
    }

    @Get("messages")
    @HasRole("ROLE_ADMIN")
    public findMessagesReports(@Query() paginationRequest: PaginationRequest,
                               @Query(ParseBoolPipe) notViewedOnly: boolean) {
        return this.reportsService.findMessagesReports(paginationRequest, notViewedOnly);
    }
}
