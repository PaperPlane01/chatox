import {Injectable} from "@nestjs/common";
import graphicsMagic, {Dimensions} from "gm";

const gm = graphicsMagic.subClass({imageMagick: true});

@Injectable()
export class GraphicsMagicService {

	public getImageDimensions(filePath: string): Promise<Dimensions> {
		return new Promise<Dimensions>((resolve, reject) => {
			gm(filePath)
				.size((error, dimensions) => {
					if (error) {
						reject(error);
					}
					resolve(dimensions);
				});
		});
	}

	public createImageThumbnail(originalImagePath: string, thumbnailPath: string, targetSize: number): Promise<void> {
		return new Promise((resolve, reject) => {
			gm(originalImagePath).resize(targetSize)
				.write(thumbnailPath, async error => {
					if (error) {
						reject(error);
					}
					resolve();
				});
		});
	}

	public createGifThumbnail(originalImagePath: string, thumbnailPath: string, targetSize: number): Promise<void> {
		return new Promise((resolve, reject) => {
			gm(`${originalImagePath}[0]`)
				.resize(targetSize)
				.write(thumbnailPath, async error => {
					if (error) {
						reject(error);
					}
					resolve();
				});
		});
	}

	/**
	 * @deprecated use {@link GraphicsMagicService#writeFirstFrame}
	 * @param originalImagePath
	 * @param previewPath
	 */
	public createGifPreview(originalImagePath: string, previewPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			gm(`${originalImagePath}[0]`)
				.write(previewPath, async error => {
					if (error) {
						reject(error);
					}

					resolve();
				});
		});
	}

	public writeFirstFrame(originalImagePath: string, resultPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			gm(originalImagePath)
				.selectFrame(0)
				.write(resultPath, async error => {
					if (error) {
						reject(error);
					}

					resolve()
				})
		});
	}
}