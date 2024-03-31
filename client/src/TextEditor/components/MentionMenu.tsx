import React, {forwardRef, FunctionComponent, useEffect, useRef, useState} from "react";
import {CircularProgress, Paper} from "@mui/material";
import {BetterMentionsMenuProps} from "lexical-better-mentions";
import {computePosition} from "@floating-ui/dom";
import {FloatingElementCoordinates} from "../types";
import {createPortal} from "react-dom";
import {commonStyles} from "../../style";

export const MentionMenu: FunctionComponent = forwardRef<
	HTMLDivElement,
	BetterMentionsMenuProps
>(({anchorEl, loading, ...props }, ref) => {
	const [coordinates, setCoordinates] = useState<FloatingElementCoordinates | null>(null);
	const innerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const selection = getSelection();
		const range = selection?.rangeCount !== 0 && selection?.getRangeAt(0);

		if (!range || !anchorEl) {
			return setCoordinates(null);
		}

		computePosition(range, anchorEl, {placement: "right"})
			.then(position => {
				let y = position.y - 40;

				if (innerRef && innerRef.current) {
					const height = innerRef.current?.getBoundingClientRect().height;

					if (y + height > window.innerHeight) {
						y = window.innerHeight - height;
					}
				}

				setCoordinates({
					x: position.x > 0 ? position.x + 30 : 10,
					y
				})
			})
			.catch(() => setCoordinates(null));
	}, [anchorEl, loading]);

	return createPortal(
		<Paper ref={ref ?? innerRef}
			  {...props}
			  style={{
				  position: "absolute",
				  top: coordinates?.y ?? 0,
				  left: coordinates?.x ?? 0,
				  visibility: anchorEl ? "visible" : "hidden",
				  opacity: anchorEl ? 1 : 0
			  }}
		>
			{loading && <CircularProgress size={25} color="primary" style={commonStyles.centered}/>}
			{props.children}
		</Paper>,
		document.body
	);
});