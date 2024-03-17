import {UserLinkPosition} from "./UserLinkPosition";

export class UserLinksResponse {
	userLinksPositions: UserLinkPosition[];

	constructor(userLinksResponse: UserLinksResponse) {
		Object.assign(this, userLinksResponse);
	}
}
