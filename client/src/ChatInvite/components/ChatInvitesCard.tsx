import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChatInviteList} from "./ChatInviteList";
import {CreateChatInviteButton} from "./CreateChatInviteButton";
import {useLocalization, useStore} from "../../store";
import {commonStyles} from "../../style";
import {BaseSettingsTabProps} from "../../utils/types";

const useStyles = makeStyles(() => createStyles({
    centered: commonStyles.centered
}));

export const ChatInvitesCard: FunctionComponent<BaseSettingsTabProps> = observer(({hideHeader = false}) => {
    const {
        chatInviteList: {
            selectedChatPaginationState: {
                pending,
            },
            selectedChatInvitesIds,
            fetchChatInvites
        },
        chat: {
            selectedChat
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    const headerLabel = selectedChat
        ? l("chat.invite.list.with-chat-name", {chatName: selectedChat.name})
        : l("chat.invite.list");

    return (
        <Card>
            {!hideHeader && <CardHeader title={headerLabel}/>}
            <CardContent>
                <CreateChatInviteButton/>
                <ChatInviteList/>
                {selectedChatInvitesIds.length === 0 && !pending && (
                    <Typography className={classes.centered} color="textSecondary">
                        {l("chat.invite.list.empty")}
                    </Typography>
                )}
                {pending && <CircularProgress size={15} color="primary" className={classes.centered}/>}
            </CardContent>
            <CardActions>
                <Button variant="outlined"
                        color="primary"
                        onClick={fetchChatInvites}
                >
                    {l("common.load-more")}
                </Button>
            </CardActions>
        </Card>
    );
});
