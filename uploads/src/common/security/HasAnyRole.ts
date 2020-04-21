import {SetMetadata} from "@nestjs/common";

export const HasAnyRole = (...roles: string[]) => SetMetadata("roles", roles);
