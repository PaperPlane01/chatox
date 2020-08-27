import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CardContent, CardHeader, createStyles, makeStyles, Theme} from "@material-ui/core";
import {Data} from "emoji-mart";
import appleData from "emoji-mart/data/apple.json";
import {UserLink} from "../../UserLink";
import {trimString} from "../../utils/string-utils";
import {useLocalization, useStore} from "../../store";
import {parseEmojis} from "../../utils/parse-emojis";

interface ReferredMessageContentProps {
    messageId?: string
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

export const ReferredMessageContent: FunctionComponent<ReferredMessageContentProps> = observer(({messageId}) => {
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

    const message = findMessage(messageId);
    const user = findUser(message.sender);

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
                    : parseEmojis(trimString(message.text, 150), appleData as any as Data)
                }
            </CardContent>
        </Fragment>
    )
});
