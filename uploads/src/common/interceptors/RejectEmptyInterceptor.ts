import {BadRequestException, CallHandler, ExecutionContext, NestInterceptor} from "@nestjs/common";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export class RejectEmptyInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle()
            .pipe(map(value => {
                if (value === null || value === undefined) {
                    throw new BadRequestException("Empty payload is not allowed");
                }

                return value;
            }));
    }

}