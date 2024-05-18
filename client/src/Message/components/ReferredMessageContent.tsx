import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardContent, CardHeader, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {FindMessageFunction, FindMessageSenderFunction} from "../types";
import {useMessageById, useMessageSenderById} from "../hooks";
import {UserLink} from "../../UserLink";
import {useLocalization, useStore} from "../../store";
import {MarkdownTextWithEmoji} from "../../Markdown";

interface ReferredMessageContentProps {
    messageId: string,
    findSenderFunction?: FindMessageSenderFunction,
    findMessageFunction?: FindMessageFunction
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    cardContentRoot: {
        paddingTop: 0,
        paddingBottom: 0,
        borderLeft: "4px solid",
        borderLeftColor: theme.palette.primary.main,
        cursor: "pointer"
    },
    cardHeaderRoot: {
        paddingLeft: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0
    }
}));

export const ReferredMessageContent: FunctionComponent<ReferredMessageContentProps> = observer(({
    messageId,
    findMessageFunction,
    findSenderFunction
}) => {
    const {
        messageDialog: {
            setMessageId: setMessageDialogMessageId
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    const message = useMessageById(messageId, false, findMessageFunction)
    const user = useMessageSenderById(message.sender, findSenderFunction);

    return (
        <Fragment>
            <CardHeader title={<UserLink user={user} displayAvatar={false} boldText/>}
                        classes={{
                            root: classes.cardHeaderRoot
                        }}
            />
            <CardContent classes={{
                root: classes.cardContentRoot
            }}
                         onClick={() => setMessageDialogMessageId(messageId)}
            >
                {message.messageDeleted
                    ? <i>{l("message.deleted")}</i>
                    : (
                        <MarkdownTextWithEmoji text={message.text}
                                               emojiData={message.emoji}
                                               renderParagraphsAsSpan
                                               renderHeadersAsPlainText
                                               renderQuotesAsPlainText
                                               renderLinksAsPlainText
                                               renderCodeAsPlainText
                        />
                    )
                }
            </CardContent>
        </Fragment>
    );
});
