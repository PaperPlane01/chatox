import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import { TableCell, TableRow } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {Check, Remove} from "@mui/icons-material";
import {format} from "date-fns";
import {CancelGlobalBanButton} from "./CancelGlobalBanButton";
import {UpdateGlobalBanButton} from "./UpdateGlobalBanButton";
import {isGlobalBanActive} from "../utils";
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
            <TableCell>
                {isGlobalBanActive(globalBan) && (
                    <Fragment>
                        <CancelGlobalBanButton globalBanId={globalBan.id}/>
                        <UpdateGlobalBanButton globalBanId={globalBan.id}/>
                    </Fragment>
                )}
            </TableCell>
        </TableRow>
    );
});
