import {applyDecorators, UseGuards} from "@nestjs/common";
import {OptionalAuthGuard} from "../guards/optional-auth.guard";

export const OptionalAuthorization = applyDecorators(UseGuards(OptionalAuthGuard))
