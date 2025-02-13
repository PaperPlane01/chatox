import {BadRequestException, Injectable} from "@nestjs/common";
import {spawn} from "promisify-child-process";
import {config} from "../config";

const ERROR_EXIT_CODE = "1";

@Injectable()
export class LottieService {

	public async createPng(input: string, output: string): Promise<void> {
		return await this.executePythonLottie(input, output, "Unable to convert lottie to png");
	}

	public async convertJsonToLottie(input: string, output: string): Promise<void> {
		return await this.executePythonLottie(input, output, "Unable to convert JSON to lottie");
	}

	private async executePythonLottie(input: string, output: string, error: string): Promise<void> {
		const {signal, stderr} = await spawn(config.PYTHON_LOTTIE_PATH, [input, output]);

		if (signal === ERROR_EXIT_CODE) {
			let errorMessage = error;

			if (stderr) {
				errorMessage = `${errorMessage}: ${typeof stderr === "string" ? stderr : stderr.toString()}`;
			}

			throw new BadRequestException(errorMessage);
		}

	}
}