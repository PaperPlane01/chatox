import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Grid} from "@mui/material";
import {NotificationSoundSelectDialog} from "./NotificationSoundSelectDialog";
import {UpdateGlobalChatsNotificationsSettingsCard} from "./UpdateGlobalChatsNotificationsSettingsCard";
import {UpdateChatNotificationsSettingsDialog} from "./UpdateChatNotificationsSettingsDialog";
import {ChatNotificationExceptionsDialog} from "./ChatNotificationExceptionsDialog";
import {UpdateUserNotificationsSettingsInChatDialog} from "./UpdateUserNotificationsSettingsInChatDialog";
import {ChatType} from "../../api/types/response";
import {useLocalization, useStore} from "../../store";
import {UserNotificationExceptionsDialog} from "./UserNotificationExceptionsDialog";

export const GlobalNotificationsSettingsUpdate: FunctionComponent = observer(() => {
	const {
		updateGlobalNotificationsSettings: {
			pending,
			saveNotificationsSettings
		}
	} = useStore();
	const {l} = useLocalization();

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<UpdateGlobalChatsNotificationsSettingsCard chatType={ChatType.GROUP}/>
			</Grid>
			<Grid item xs={12}>
				<UpdateGlobalChatsNotificationsSettingsCard chatType={ChatType.DIALOG}/>
			</Grid>
			<Grid item xs={12}>
				<Button variant="contained"
						color="primary"
						disabled={pending}
						onClick={saveNotificationsSettings}
				>
					{pending && <CircularProgress size={15} color="primary"/>}
					{l("save-changes")}
				</Button>
			</Grid>
			<NotificationSoundSelectDialog/>
			<UpdateChatNotificationsSettingsDialog/>
			<ChatNotificationExceptionsDialog/>
			<UpdateUserNotificationsSettingsInChatDialog/>
			<UserNotificationExceptionsDialog/>
		</Grid>
	);
});
