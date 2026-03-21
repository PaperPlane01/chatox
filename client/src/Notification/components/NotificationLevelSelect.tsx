import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CSSProperties, FormControl, InputLabel, MenuItem, Select, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useLocalization} from "../../store";
import {NOTIFICATION_LEVELS, NotificationLevel} from "../../api/types/response";
import {Labels} from "../../localization";

interface NotificationLevelSelectProps {
	value: NotificationLevel,
	onChange: (notificationLevel: NotificationLevel) => void,
	style?: CSSProperties
}

const useStyles = makeStyles()((theme: Theme) => ({
    formControl: {
		paddingTop: theme.spacing(1)
	}
}));

export const NotificationLevelSelect: FunctionComponent<NotificationLevelSelectProps> = observer(({
	value,
	onChange,
	style
}) => {
	const {l} = useLocalization();
	const {classes} = useStyles();

	return (
		<FormControl fullWidth className={classes.formControl} style={style}>
			<InputLabel id="notification-level-select-label">
				{l("notification.level")}
			</InputLabel>
			<Select labelId="notification-level-select-label"
					id="notification-level-select"
					value={value}
					defaultValue={value}
					onChange={event => onChange(event.target.value as any as NotificationLevel)}
			>
				{NOTIFICATION_LEVELS.map(notificationLevel => (
					<MenuItem value={notificationLevel}
							  key={notificationLevel}
					>
						{l(`notification.level.${notificationLevel}` as keyof Labels)}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
});
