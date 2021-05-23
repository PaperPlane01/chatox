import {Transform} from "class-transformer";
import {getValidPage, getValidPageSize} from "../../utils";

export class PaginationRequest {
    @Transform(({value}) => getValidPage(value))
    page: number = 1;

    @Transform(({value}) => getValidPageSize(value))
    pageSize: number = 30;

    constructor(page: number | string = 1, pageSize: number | string = 30) {
        this.page = getValidPage(page);
        this.pageSize = getValidPageSize(pageSize);
    }
}
