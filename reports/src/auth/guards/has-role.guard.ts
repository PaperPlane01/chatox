import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {REQUIRED_ROLES} from "../constants";
import {UserRole} from "../types/user-role";
import {User} from "../types/user";

@Injectable()
export class HasRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }
    
    public canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<UserRole[]>(REQUIRED_ROLES, context.getHandler());
        
        if (requiredRoles.length === 0) {
            return true;
        }
        
        const user = (context.switchToHttp().getRequest() as any).user as User;
        
        return user.roles.some(role => requiredRoles.includes(role));
    }

}
