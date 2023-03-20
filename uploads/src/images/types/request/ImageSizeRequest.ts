import {IsInt, Max, Min, ValidateIf} from "class-validator";
import {Transform} from "class-transformer";

export class ImageSizeRequest {
    @ValidateIf((object: ImageSizeRequest) => object.size !== null && object.size !== undefined)
    @Transform(({value}) => {
        if (value !== null && value !== undefined && value.trim().length !== 0) {
            return Number(value);
        }

        return undefined;
    })
    @IsInt()
    @Min(40)
    @Max(2056)
    size?: number;
}
