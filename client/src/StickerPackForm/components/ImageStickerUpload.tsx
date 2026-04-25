import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {StickerUploadProps} from "./StickerUploadProps";
import {useLocalization} from "../../store";
import {ImageUpload} from "../../Upload";

export const ImageStickerUpload: FunctionComponent<StickerUploadProps> = observer(({
	stickerContainer
}) => {
	const {l} = useLocalization();

	return (
		<ImageUpload onFileAttached={stickerContainer.uploadFile}
					 pending={Boolean(stickerContainer.uploadContainer?.pending)}
					 avatarProps={{
						 width: 200,
						 height: 200,
						 shape: "square",
						 avatarUri: stickerContainer.uploadContainer
							 ? stickerContainer.uploadContainer.url
							 : undefined
					 }}
					 uploadButtonLabel={l("sticker.image")}
					 validationError={stickerContainer.fileValidationError && l(stickerContainer.fileValidationError)}
					 accept={stickerContainer.acceptedFiles}
		/>
	);
});
