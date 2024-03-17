import {TokenPosition} from "./TokenPosition";

export class UserLinkPosition extends TokenPosition {
	userIdOrSlug: string;

	constructor({start, end, userIdOrSlug}: Pick<UserLinkPosition, "start" | "end" | "userIdOrSlug">) {
		super({start, end});
		this.userIdOrSlug = userIdOrSlug;
	}
}
