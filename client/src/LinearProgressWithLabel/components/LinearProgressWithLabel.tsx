import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Box, LinearProgress, Typography} from "@mui/material";

interface LinearProgressWithLabelProps {
	value: number
}

export const LinearProgressWithLabel: FunctionComponent<LinearProgressWithLabelProps> = observer(({
	value
}) => (
	<Box sx={{
		display: "flex",
		alignItems: "center",
		p: 1
	}}>
		<Box sx={{
			width: "100%",
			pr: 1
		}}>
			<LinearProgress value={value}
							variant="determinate"
							color="primary"
			/>
		</Box>
		<Typography variant="body2"
					color="textSecondary"
		>
			{value}%
		</Typography>
	</Box>
));
