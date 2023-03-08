import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, Skeleton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Info} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import {useLocalization, useStore} from "../../store";

const breaks = require("remark-breaks");

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
                        : (
                            <ReactMarkdown children={chat.description ? chat.description : l("chat.no-description")}
                                           remarkPlugins={[breaks]}
                            />
                        )
                    }
                </CardContent>
            </Card>
        );
    } else {
        return null;
    }
});
