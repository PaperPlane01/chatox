import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardContent, CardHeader, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {MessageEntity} from "../types";
import {UserLink} from "../../UserLink";
import {trimString} from "../../utils/string-utils";
import {useLocalization, useStore} from "../../store";
import {useEmojiParser} from "../../Emoji";
import {UserEntity} from "../../User";
import {MarkdownTextWithEmoji} from "../../Markdown";

interface ReferredMessageContentProps {
    messageId?: string,
    findSenderFunction?: (id: string) => UserEntity,
    findMessageFunction?: (id: string) => MessageEntity
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
        entities: {
            messages: {
                findById: findMessage
            },
            users: {
                findById: findUser
            }
        },
        messageDialog: {
            setMessageId: setMessageDialogMessageId
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    if (!messageId) {
        return null;
    }

    const message = findMessageFunction
        ? findMessageFunction(messageId)
        : findMessage(messageId);
    const user = findSenderFunction
        ? findSenderFunction(message.sender)
        : findUser(message.sender);

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
                {message.deleted
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
    )
});
