import {applyDecorators, SetMetadata, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {JWT_STRATEGY, REQUIRED_ROLES} from "../constants";
import {UserRole} from "../types/user-role";

export const HasRole = (...roles: UserRole[]) => applyDecorators(
    SetMetadata(REQUIRED_ROLES, roles),
    UseGuards(AuthGuard(JWT_STRATEGY))
)
