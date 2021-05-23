import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {User} from "../types/user";

export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        return (context.switchToHttp().getRequest() as any).user as User | undefined
    }
);
