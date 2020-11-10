import {SetMetadata} from "@nestjs/common";
import {UserRole} from "./UserRole";

export const HasAnyRole = (...roles: UserRole[]) => SetMetadata("roles", roles);
