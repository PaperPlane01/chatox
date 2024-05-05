import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Avatar} from "@mui/material";
import {BaseAvatarProps} from "./BaseAvatarProps";

interface LetterAvatarProps extends BaseAvatarProps {
	letter: string,
	color: string
}

export const LetterAvatar: FunctionComponent<LetterAvatarProps> = observer(({
	width = 40,
	height = 40,
	variant = "circular",
	className,
	onClick,
	letter,
	color
}) => (
	<Avatar className={className}
			variant={variant}
			style={{
				width,
				height,
				backgroundColor: color
			}}
			onClick={onClick}
	>
		{letter}
	</Avatar>
));
