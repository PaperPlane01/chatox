import {Body, Controller, Get, Param, Post, Put, Query, ValidationPipe} from "@nestjs/common";
import {ReportsService} from "./reports.service";
import {CreateReportRequest} from "./types/requests/create-report.request";
import {FilterReportsRequest} from "./types/requests/filter-reports.request";
import {UpdateReportRequest} from "./types/requests/update-report.request";
import {UpdateMultipleReportsRequest} from "./types/requests/update-multiple-reports.request";
import {OptionalAuthorization} from "../auth/decorators/optional-authorization.decorator";
import {RequestIp} from "../auth/decorators/request-ip.decorator";
import {CurrentUser} from "../auth/decorators/current-user.decorator";
import {HasRole} from "../auth/decorators/has-role.decorator";
import {User} from "../auth/types/user";

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
        return this.reportsService.findReports(reportFilters);
    }

    @Put()
    @HasRole("ROLE_ADMIN")
    public updateMultipleReports(@Body() updateMultipleReportsRequest: UpdateMultipleReportsRequest) {
        return this.reportsService.updateMultipleReports(updateMultipleReportsRequest);
    }

    @Put("{id}")
    @HasRole("ROLE_ADMIN")
    public updateReport(@Param("id") id: string, @Body() updateReportRequest: UpdateReportRequest) {
        return this.reportsService.updateReport(id, updateReportRequest);
    }
}
