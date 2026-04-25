import {BadRequestException} from "@nestjs/common";

export class InvalidLottieStickerException extends BadRequestException {
	constructor(public errors?: string[]) {
		super("Lottie sticker is invalid");
	}
}
