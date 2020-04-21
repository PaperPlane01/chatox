import {Inject, Injectable} from "@nestjs/common";
import {REQUEST} from "@nestjs/core";
import {Request} from "express";
import {CurrentUser} from "../auth/types";

@Injectable()
export class CurrentUserHolder {
    constructor(@Inject(REQUEST) private readonly request: Request) {}

    public getCurrentUser(): CurrentUser | undefined {
        return this.request.user as CurrentUser | undefined;
    }
}
