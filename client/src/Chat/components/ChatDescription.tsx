import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, createStyles, makeStyles} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info"
import {Skeleton} from "@material-ui/lab";
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
                    <InfoIcon/>
                    {pending
                        ? <Skeleton variant="text" width={60}/>
                        : (
                            <ReactMarkdown source={chat.description ? chat.description : l("chat.no-description")}
                                           plugins={[breaks]}
                            />
                        )
                    }
                </CardContent>
            </Card>
        )
    } else {
        return null;
    }
});
