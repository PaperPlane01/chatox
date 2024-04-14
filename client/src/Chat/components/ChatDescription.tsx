import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, Skeleton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Info} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {MarkdownTextWithEmoji} from "../../Markdown";

const useStyles = makeStyles(() => createStyles({
    root: {
        paddingLeft: 0,
        paddingRight: 0
    }
}));

export const ChatDescription: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId,
            pending
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    if (selectedChatId) {
        const chat = findChat(selectedChatId);

        return (
            <Card classes={{
                root: classes.root
            }}>
                <CardContent>
                    <Info/>
                    {pending
                        ? <Skeleton variant="text" width={60}/>
                        : <MarkdownTextWithEmoji text={chat.description ? chat.description : l("chat.no-description")}/>
                    }
                </CardContent>
            </Card>
        );
    } else {
        return null;
    }
});
