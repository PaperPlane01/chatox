import {ArrayMaxSize, IsArray, IsNotEmpty, IsString} from "class-validator";
import {Transform} from "class-transformer";
import {BadRequestException} from "@nestjs/common";

export class GetUploadsInfoByIdsRequest {
	@Transform(({value}) => {
		if (Array.isArray(value)) {
			return value;
		}

		try {
			return JSON.parse(value);
		} catch (e) {
			console.error(e);
			throw new BadRequestException("Invalid array")
		}
	})
	@IsArray()
	@IsNotEmpty()
	@IsString({each: true})
	@ArrayMaxSize(10)
	ids: string[];
}