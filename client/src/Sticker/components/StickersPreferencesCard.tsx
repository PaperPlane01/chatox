import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, IconButton, FormControlLabel, Switch, TextField} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const StickersPreferencesCard: FunctionComponent = observer(() => {
	const {
		stickersPreferences: {
			autoplay,
			loop,
			loopsCount,
			setAutoplay,
			setLoop,
			setLoopsCount
		}
	} = useStore();
	const {l} = useLocalization();

	return (
		<Card>
			<CardHeader title={l("sticker.preferences")}/>
			<CardContent>
				<FormControlLabel control={
					<Switch checked={autoplay}
							onChange={() => setAutoplay(!autoplay)}
					/>
				}
								  label={l("sticker.preferences.autoplay")}
				/>
				<FormControlLabel control={
					<Switch checked={loop}
							onChange={() => setLoop(!loop)}
					/>
				}
								  label={l("sticker.preferences.loop")}
				/>
				{loop && (
					<TextField type="number"
							   value={loopsCount}
							   onChange={event => setLoopsCount(Number(event.target.value))}
							   fullWidth
							   variant="outlined"
							   label={l("sticker.preferences.loops-count")}
							   inputProps={{
								   min: 0
							   }}
							   helperText={l("sticker.preferences.loops-count.zero")}
							   InputProps={{
								   endAdornment: (
									   <IconButton onClick={() => setLoopsCount(undefined)}>
										   <Close/>
									   </IconButton>
								   )
							   }}
					/>
				)}
			</CardContent>
		</Card>
	);
});
