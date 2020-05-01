import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, makeStyles, TableCell, TableRow, Theme, Typography} from "@material-ui/core";
import {format} from "date-fns";
import randomColor from "randomcolor";
import {CancelChatBlockingButton} from "./CancelChatBlockingButton";
import {ChatBlockingEntity} from "../types";
import {isChatBlockingActive} from "../utils";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {getUserAvatarLabel} from "../../User/utils/get-user-avatar-label";
import {localized, Localized} from "../../localization";
import {Routes} from "../../router";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

const useStyles = makeStyles((theme: Theme) => createStyles({
    userLink: {
        color: "inherit",
        textDecoration: "none",
        display: "flex"
    },
    userNicknameTypography: {
        marginLeft: theme.spacing(1)
    }
}));

interface ChatBlockingsTableRowMobxProps {
    findChatBlocking: (id: string) => ChatBlockingEntity,
    findUser: (id: string) => UserEntity,
    routerStore?: any
}

interface ChatBlockingsTableRowOwnProps {
    chatBlockingId: string
}

type ChatBlockingsTableRowProps = ChatBlockingsTableRowMobxProps & ChatBlockingsTableRowOwnProps & Localized;

const _ChatBlockingsTableRow: FunctionComponent<ChatBlockingsTableRowProps> = ({
    chatBlockingId,
    findChatBlocking,
    findUser,
    dateFnsLocale,
    routerStore
}) => {
    const classes = useStyles();
    const chatBlocking = findChatBlocking(chatBlockingId);
    const blockedUser = findUser(chatBlocking.blockedUserId);
    const blockedBy = findUser(chatBlocking.blockedById);
    const canceledBy = chatBlocking.canceledByUserId ? findUser(chatBlocking.canceledByUserId) : undefined;
    const updatedBy = chatBlocking.lastModifiedByUserId ? findUser(chatBlocking.lastModifiedByUserId) : undefined;
    const blockedUserAvatarLabel = getUserAvatarLabel(blockedUser);
    const blockedByAvatarLabel = getUserAvatarLabel(blockedBy);
    const blockedUserAvatarColor = randomColor({seed: blockedUser.id});
    const blockedByAvatarColor = randomColor({seed: blockedBy.id});
    const canceledByAvatarLabel = canceledBy && getUserAvatarLabel(canceledBy);
    const canceledByAvatarColor = canceledBy && randomColor({seed: canceledBy.id});
    const updatedByAvatarLabel = updatedBy && getUserAvatarLabel(updatedBy);
    const updatedByAvatarColor = updatedBy && randomColor({seed: updatedBy.id});

    return (
        <TableRow>
            <TableCell>
                <Link view={Routes.userPage}
                      params={{slug: blockedUser.slug}}
                      className={classes.userLink}
                      store={routerStore}
                >
                    <Avatar avatarLetter={blockedUserAvatarLabel}
                            avatarColor={blockedUserAvatarColor}
                            width={25}
                            height={25}
                            avatarUri={blockedUser.avatarUri}
                    />
                    <Typography className={classes.userNicknameTypography}
                                style={{color: blockedUserAvatarColor}}
                    >
                        {blockedUser.firstName} {blockedUser.lastName && blockedUser.lastName}
                    </Typography>
                </Link>
            </TableCell>
            <TableCell>
                {format(chatBlocking.createdAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
            </TableCell>
            <TableCell>
                {format(chatBlocking.blockedUntil, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
            </TableCell>
            <TableCell>
                {chatBlocking.description ? chatBlocking.description : "—"}
            </TableCell>
            <TableCell>
                <Link view={Routes.userPage}
                      params={{slug: blockedBy.slug}}
                      className={classes.userLink}
                      store={routerStore}
                >
                    <Avatar avatarLetter={blockedByAvatarLabel}
                            avatarColor={blockedByAvatarColor}
                            width={25}
                            height={25}
                            avatarUri={blockedBy.avatarUri}
                    />
                    <Typography className={classes.userNicknameTypography}
                                style={{color: blockedByAvatarColor}}
                    >
                        {blockedBy.firstName} {blockedBy.lastName && blockedBy.lastName}
                    </Typography>
                </Link>
            </TableCell>
            <TableCell>
                {chatBlocking.canceledAt
                    ? format(chatBlocking.canceledAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : "—"
                }
            </TableCell>
            <TableCell>
                {canceledBy
                    ? (
                        <Link view={Routes.userPage}
                              params={{slug: canceledBy.slug}}
                              className={classes.userLink}
                              store={routerStore}
                        >
                            <Avatar avatarLetter={canceledByAvatarLabel!}
                                    avatarColor={canceledByAvatarColor!}
                                    width={25}
                                    height={25}
                                    avatarUri={canceledBy.avatarUri}
                            />
                            <Typography className={classes.userNicknameTypography}
                                        style={{color: canceledByAvatarColor}}
                            >
                                {canceledBy.firstName} {canceledBy.lastName && canceledBy.lastName}
                            </Typography>
                        </Link>
                    )
                    : "—"
                }
            </TableCell>
            <TableCell>
                {chatBlocking.lastModifiedAt
                    ? format(chatBlocking.lastModifiedAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : "—"
                }
            </TableCell>
            <TableCell>
                {updatedBy
                    ? (
                        <Link view={Routes.userPage}
                              params={{slug: updatedBy.slug}}
                              className={classes.userLink}
                              store={routerStore}
                        >
                            <Avatar avatarLetter={updatedByAvatarLabel!}
                                    avatarColor={updatedByAvatarColor!}
                                    width={25}
                                    height={25}
                                    avatarUri={updatedBy.avatarUri}
                            />
                            <Typography className={classes.userNicknameTypography}
                                        style={{color: updatedByAvatarColor}}
                            >
                                {updatedBy.firstName} {updatedBy.lastName && updatedBy.lastName}
                            </Typography>
                        </Link>
                    )
                    : "—"
                }
            </TableCell>
            {isChatBlockingActive(chatBlocking) && (
                <CancelChatBlockingButton chatBlockingId={chatBlocking.id}/>
            )}
        </TableRow>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsTableRowMobxProps> = ({entities, store}) => ({
    findChatBlocking: entities.chatBlockings.findById,
    findUser: entities.users.findById,
    routerStore: store
});

export const ChatBlockingsTableRow = localized(
    inject(mapMobxToProps)(observer(_ChatBlockingsTableRow))
) as FunctionComponent<ChatBlockingsTableRowOwnProps>;
