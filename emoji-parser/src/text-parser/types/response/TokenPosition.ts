export class TokenPosition {
	start: number;
	end: number;

	constructor({start, end}: Pick<TokenPosition, "start" | "end">) {
		this.start = start;
		this.end = end;
	}
}
