import {Inject, Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {AxiosError, AxiosInstance} from "axios";
import FormData from "form-data";
import {createReadStream, createWriteStream, PathLike, ReadStream} from "fs";
import * as stream from "stream";
import {promisify} from "util";
import {LOTTIE_SERVICE_AXIOS_INSTANCE} from "./constants";
import {LottieValidationResponse} from "./types/responses";
import {InvalidLottieStickerException} from "./exceptions";

const finished = promisify(stream.finished);

@Injectable()
export class LottieService {
	private readonly log = new Logger(LottieService.name);

	constructor(@Inject(LOTTIE_SERVICE_AXIOS_INSTANCE) private readonly axios: AxiosInstance) {
	}

	public async checkStickerValidity(filePath: PathLike, fileName: string): Promise<void> {
		const fileStream = createReadStream(filePath);

		const formData = new FormData();
		formData.append("file", fileStream, {filename: fileName});

		try {
			const {data} = await this.axios.post<LottieValidationResponse>(
				"http://lottie-service/api/v1/lottie/validation",
				formData,
				{
					headers: {...formData.getHeaders()}
				}
			);

			if (!data.ok) {
				throw new InvalidLottieStickerException(data.errors);
			}
		} catch (error) {
			if (error instanceof InvalidLottieStickerException) {
				throw error;
			} else if (error?.response?.data) {
				const axiosError = error as AxiosError<LottieValidationResponse>;
				const response = axiosError.response.data;
				throw new InvalidLottieStickerException(response.errors);
			} else {
				this.log.error("Error occurred when tried to validate lottie sticker", error)
				throw new InternalServerErrorException();
			}
		}
	}

	public async convertDotLottieToTgs(inputFile: PathLike, outputFile: PathLike, fileName: string): Promise<void> {
		const fileStream = createReadStream(inputFile);
		const formData = new FormData();
		formData.append("file", fileStream, {filename: fileName});

		const writer = createWriteStream(outputFile);

		try {
			const {data} = await this.axios.post<ReadStream>(
				"http://lottie-service/api/v1/lottie/conversion/dot-lottie-to-tgs",
				formData,
				{
					headers: {...formData.getHeaders()},
					responseType: "stream"
				}
			);
			data.pipe(writer);
			await finished(writer);
		} catch (error) {
			this.log.error("Error occurred when tried to convert dot lottie to tgs", error);
			throw new InternalServerErrorException();
		}
	}

	public async convertJsonToTgs(inputFile: PathLike, outputFile: PathLike, fileName: string): Promise<void> {
		const fileStream = createReadStream(inputFile);
		const formData = new FormData();
		formData.append("file", fileStream, {filename: fileName});

		const writer = createWriteStream(outputFile);

		try {
			const {data} = await this.axios.post<ReadStream>(
				"http://lottie-service/api/v1/lottie/conversion/json-to-tgs",
				formData,
				{
					headers: {...formData.getHeaders()},
					responseType: "stream"
				}
			);
			data.pipe(writer);
			await finished(writer);
		} catch (error) {
			this.log.error("Error occurred when tried to convert tgs to dot lottie", error);
			throw new InternalServerErrorException();
		}
	}

	public async convertTgsToDotLottie(inputFile: PathLike, outputFile: PathLike, fileName: string): Promise<void> {
		const fileStream = createReadStream(inputFile);
		const formData = new FormData();
		formData.append("file", fileStream, {filename: fileName});

		const writer = createWriteStream(outputFile);

		try {
			const {data} = await this.axios.post<ReadStream>(
				"http://lottie-service/api/v1/lottie/conversion/tgs-to-dot-lottie",
				formData,
				{
					headers: {...formData.getHeaders()},
					responseType: "stream"
				}
			);
			data.pipe(writer);
			await finished(writer);
		} catch (error) {
			this.log.error("Error occurred when tried to convert json to dot lottie", error);
			throw new InternalServerErrorException();
		}
	}

	public async convertTgsToPng(inputFile: PathLike, outputFile: PathLike, fileName: string): Promise<void> {
		const fileStream = createReadStream(inputFile);
		const formData = new FormData();
		formData.append("file", fileStream, {filename: fileName});

		const writer = createWriteStream(outputFile);

		try {
			const {data} = await this.axios.post<ReadStream>(
				"http://lottie-service/api/v1/lottie/conversion/tgs-to-png",
				formData,
				{
					headers: {...formData.getHeaders()},
					responseType: "stream"
				}
			);
			data.pipe(writer);
			await finished(writer);
		} catch (error) {
			this.log.error("Error occurred when tried to convert tgs to png", error);
			throw new InternalServerErrorException();
		}
	}
}
