import {HttpException, HttpStatus, Logger} from "@nestjs/common";
import {Response} from "express";
import {createReadStream, PathLike} from "fs";

export const streamFileToResponse = (path: PathLike, response: Response, logger?: Logger): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const stream = createReadStream(path);

        stream.on("error", error => {
            if (logger) {
                logger.error("Error occurred when tried to create file stream", error.stack);
            }

            response.setHeader("Content-Type", "application/json");
            reject(new HttpException(
                "Could not find file",
                HttpStatus.NOT_FOUND
            ));
        });

        stream.on("data", data => response.write(data));

        stream.on("end", () => response.status(200).send());
    });
}