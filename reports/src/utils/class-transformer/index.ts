import {BadRequestException} from "@nestjs/common";

export const transformToEnumArray = <ResultEnum>(value: any, parseFunction: (value: string) => ResultEnum): ResultEnum[] => {
    if (!value) {
        return [];
    }

    if (`${value}`.startsWith('[')) {
        try {
            return JSON.parse(value).map(enumValue => parseFunction(enumValue));
        } catch (error) {
            throw new BadRequestException(`Invalid array: ${value}`)
        }
    } else {
       return `${value}`.split(',').map(enumValue => parseFunction(enumValue))
    }
};
