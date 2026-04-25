import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Avatar} from "@mui/material";
import {BaseAvatarProps} from "./BaseAvatarProps";

interface ExternalImageAvatarProps extends BaseAvatarProps {
	externalUri: string
}

export const ExternalImageAvatar: FunctionComponent<ExternalImageAvatarProps> = observer(({
	width = 40,
	height = 40,
	variant = "circular",
	className,
	onClick,
	externalUri
}) => (
	<Avatar src={externalUri}
			style={{
				width,
				height
			}}
			variant={variant}
			className={className}
			onClick={onClick}
	/>
));
