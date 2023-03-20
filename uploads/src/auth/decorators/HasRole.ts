import {applyDecorators, SetMetadata, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {UserRole} from "../types";
import {JWT_STRATEGY, REQUIRED_ROLES} from "../constants";
import {RolesGuard} from "../RolesGuard";

export const HasRole = (...roles: UserRole[]) => applyDecorators(
    SetMetadata(REQUIRED_ROLES, roles),
    UseGuards(AuthGuard(JWT_STRATEGY), RolesGuard)
);
