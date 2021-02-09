import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles, TableCell, TableRow} from "@material-ui/core";
import {Check, Remove} from "@material-ui/icons";
import {format} from "date-fns";
import {UserLink} from "../../UserLink";
import {useLocalization, useStore} from "../../store";
import {Labels} from "../../localization";

interface GlobalBansTableRowProps {
    globalBanId: string
}

const useStyles = makeStyles(() => createStyles({
    globalBansTableRow: {
        cursor: "pointer"
    }
}));

export const GlobalBansTableRow: FunctionComponent<GlobalBansTableRowProps> = observer(({
    globalBanId
}) => {
    const {
        entities: {
            globalBans: {
                findById: findGlobalBan
            },
            users: {
                findById: findUser
            }
        },
        globalBanDetailsDialog: {
            setGlobalBanId,
            setGlobalBanDetailsDialogOpen
        }
    } = useStore();
    const {dateFnsLocale, l} = useLocalization();
    const classes = useStyles();

    const globalBan = findGlobalBan(globalBanId);
    const bannedUser = findUser(globalBan.bannedUserId);
    const bannedBy = findUser(globalBan.createdById);

    const openGlobalBanDetailsDialog = (): void => {
        setGlobalBanId(globalBanId);
        setGlobalBanDetailsDialogOpen(true);
    };

    return (
        <TableRow className={classes.globalBansTableRow}
                  onClick={openGlobalBanDetailsDialog}
        >
            <TableCell>
                <UserLink user={bannedUser} displayAvatar/>
            </TableCell>
            <TableCell>
                {format(globalBan.createdAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
            </TableCell>
            <TableCell>
                {globalBan.expiresAt
                    ? format(globalBan.expiresAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : <Remove/>
                }
            </TableCell>
            <TableCell>
                {globalBan.permanent
                    ? <Check/>
                    : <Remove/>
                }
            </TableCell>
            <TableCell>
                {l(`global.ban.reason.${globalBan.reason}` as keyof Labels)}
            </TableCell>
            <TableCell>
                <UserLink user={bannedBy} displayAvatar/>
            </TableCell>
        </TableRow>
    );
});
