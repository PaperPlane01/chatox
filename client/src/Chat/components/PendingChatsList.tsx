import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, CircularProgress, List, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {PendingChatsListItem} from "./PendingChatsListItem";
import {useLocalization, useStore} from "../../store";
import {commonStyles} from "../../style";

const useStyles = makeStyles()(() => ({
    centered: commonStyles.centered,
}));

export const PendingChatsList: FunctionComponent = observer(() => {
    const {
        pendingChats: {
            chatsIds,
            pending
        }
    } = useStore();
    const {l} = useLocalization();
    const {classes} = useStyles();

    return (
        <Card>
            <CardHeader title={l("pending.chat.list")}/>
            <CardContent>
                {pending && <CircularProgress size={15} color="primary" className={classes.centered} />}
                {!pending && chatsIds.length === 0 && (
                    <Typography color="textSecondary" className={classes.centered}>
                        {l("pending.chat.list.empty")}
                    </Typography>
                )}
                <List>
                    {chatsIds.map(chatId => (
                        <PendingChatsListItem chatId={chatId} key={chatId}/>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
});
