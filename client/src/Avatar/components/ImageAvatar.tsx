import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Avatar} from "@mui/material";
import {BaseAvatarProps} from "./BaseAvatarProps";
import {useEntitySelector} from "../../entities";

interface ImageAvatarProps extends BaseAvatarProps {
	avatarId: string
}

const getTargetSize = (width: string | number): number => {
	if (typeof width === "number") {
		return width > 256 ? width : 256;
	} else {
		return 512;
	}
}

export const ImageAvatar: FunctionComponent<ImageAvatarProps> = observer(({
	avatarId,
	width = 40,
	height = 40,
	variant = "circular",
	className,
	onClick
}) => {
	const image = useEntitySelector("uploads", entities => entities.uploads.findImage(avatarId));
	const targetSize = getTargetSize(width);
	const uri = `${image.uri}?size=${targetSize}`;

	return (
		<Avatar src={uri}
				style={{
					width,
					height
				}}
				variant={variant}
				className={className}
				onClick={onClick}
		/>
	);
});
