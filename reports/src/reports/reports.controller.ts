import {Body, Controller, Post, Query, ParseBoolPipe, Get, ValidationPipe} from "@nestjs/common";
import {ReportsService} from "./reports.service";
import {CreateReportRequest} from "./types/requests/create-report.request";
import {OptionalAuthorization} from "../auth/decorators/optional-authorization.decorator";
import {RequestIp} from "../auth/decorators/request-ip.decorator";
import {CurrentUser} from "../auth/decorators/current-user.decorator";
import {HasRole} from "../auth/decorators/has-role.decorator";
import {User} from "../auth/types/user";
import {PaginationRequest} from "../utils/pagination/types/requests";
import {FilterReportsRequest} from "./types/requests/filter-reports.request";

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

    @Get()
    @HasRole("ROLE_ADMIN")
    public findReports(@Query(new ValidationPipe({transform: true})) reportFilters: FilterReportsRequest) {
        console.log(reportFilters);
        return this.reportsService.findReports(reportFilters);
    }
}
