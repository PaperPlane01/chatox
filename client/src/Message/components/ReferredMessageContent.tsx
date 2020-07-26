import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {CardContent, CardHeader, createStyles, makeStyles, Theme} from "@material-ui/core";
import {UserLink} from "../../UserLink";
import {MessageEntity} from "../types";
import {UserEntity} from "../../User";
import {trimString} from "../../utils/string-utils";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ReferredMessageContentMobxProps {
    findMessage: (id: string) => MessageEntity,
    findUser: (id: string) => UserEntity,
    setMessageDialogMessageId: (messageId?: string) => void
}

interface ReferredMessageContentOwnProps {
    messageId?: string
}

type ReferredMessageContentProps = ReferredMessageContentMobxProps & ReferredMessageContentOwnProps & Localized;

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

const _ReferredMessageContent: FunctionComponent<ReferredMessageContentProps> = ({
    messageId,
    findMessage,
    findUser,
    setMessageDialogMessageId,
    l
}) => {
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
                    : trimString(message.text, 150)
                }
            </CardContent>
        </Fragment>
    )
};

const mapMobxToProps: MapMobxToProps<ReferredMessageContentMobxProps> = ({
    messageDialog,
    entities
}) => ({
    setMessageDialogMessageId: messageDialog.setMessageId,
    findMessage: entities.messages.findById,
    findUser: entities.users.findById
});

export const ReferredMessageContent = localized(
    inject(mapMobxToProps)(observer(_ReferredMessageContent))
) as FunctionComponent<ReferredMessageContentOwnProps>;
