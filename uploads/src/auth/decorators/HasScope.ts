import {applyDecorators, SetMetadata, UseGuards} from "@nestjs/common";
import {JWT_STRATEGY, REQUIRED_SCOPES} from "../constants";
import {AuthGuard} from "@nestjs/passport";
import {ScopesGuard} from "../ScopesGuard";

export const HasScope = (...scopes: string[]) => applyDecorators(
    SetMetadata(REQUIRED_SCOPES, scopes),
    UseGuards(AuthGuard(JWT_STRATEGY), ScopesGuard)
);
