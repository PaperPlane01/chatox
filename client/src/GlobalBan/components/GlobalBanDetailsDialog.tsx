import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@material-ui/core";
import {Check, Remove} from "@material-ui/icons";
import {format} from "date-fns";
import {GlobalBanMenu} from "./GlobalBanMenu";
import {isGlobalBanActive} from "../utils";
import {useLocalization, useStore} from "../../store";
import {getUserDisplayedName} from "../../User/utils/labels";
import {UserLink} from "../../UserLink";
import {Labels} from "../../localization";

const useStyles = makeStyles(() => createStyles({
    globalBanMenuWrapper: {
        float: "right"
    }
}));

export const GlobalBanDetailsDialog: FunctionComponent = observer(() => {
    const {
        globalBanDetailsDialog: {
            globalBanDetailsDialogOpen,
            globalBanId,
            setGlobalBanDetailsDialogOpen,
            setGlobalBanId
        },
        entities: {
            globalBans: {
                findById: findGlobalBan
            },
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const {dateFnsLocale, l} = useLocalization();
    const classes = useStyles();

    if (!globalBanId) {
        return null;
    }

    const closeDialog = (): void => {
        setGlobalBanDetailsDialogOpen(false);
        setGlobalBanId(undefined);
    };

    const globalBan = findGlobalBan(globalBanId);
    const bannedUser = findUser(globalBan.bannedUserId);
    const bannedBy = findUser(globalBan.createdById);
    const canceledBy = globalBan.canceledById ? findUser(globalBan.canceledById) : undefined;
    const updatedBy = globalBan.updatedById ? findUser(globalBan.updatedById) : undefined;

    return (
        <Dialog open={globalBanDetailsDialogOpen}
                fullScreen
                onClose={closeDialog}
        >

            <DialogTitle>
                {l("global.ban.details", {username: getUserDisplayedName(bannedUser)})}
                {isGlobalBanActive(globalBan) && (
                    <div className={classes.globalBanMenuWrapper}>
                        <GlobalBanMenu globalBanId={globalBanId}/>
                    </div>
                )}
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.banned-user")}
                            </TableCell>
                            <TableCell>
                                <UserLink user={bannedUser} displayAvatar/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.created-by")}
                            </TableCell>
                            <TableCell>
                                <UserLink user={bannedBy} displayAvatar/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.created-at")}
                            </TableCell>
                            <TableCell>
                                {format(globalBan.createdAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.expires-at")}
                            </TableCell>
                            <TableCell>
                                {globalBan.expiresAt
                                    ? format(globalBan.expiresAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                                    : <Remove/>
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.permanent")}
                            </TableCell>
                            <TableCell>
                                {globalBan.permanent ? <Check/> : <Remove/>}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.reason")}
                            </TableCell>
                            <TableCell>
                                {l(`global.ban.reason.${globalBan.reason}` as keyof Labels)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.comment")}
                            </TableCell>
                            <TableCell>
                                {globalBan.comment}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.canceled-at")}
                            </TableCell>
                            <TableCell>
                                {globalBan.canceledAt
                                    ? format(globalBan.canceledAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                                    : <Remove/>
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.canceled-by")}
                            </TableCell>
                            <TableCell>
                                {canceledBy
                                    ? <UserLink user={canceledBy} displayAvatar/>
                                    : <Remove/>
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                {l("global.ban.updated-by")}
                            </TableCell>
                            <TableCell>
                                {updatedBy
                                    ? <UserLink user={updatedBy} displayAvatar/>
                                    : <Remove/>
                                }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={closeDialog}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
