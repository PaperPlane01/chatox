import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableCell, TableRow} from "@material-ui/core";
import {Check, Remove} from "@material-ui/icons";
import {format} from "date-fns";
import {UserLink} from "../../UserLink";
import {useLocalization, useStore} from "../../store";
import {Labels} from "../../localization";

interface GlobalBansTableRowProps {
    globalBanId: string
}

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
        }
    } = useStore();
    const {dateFnsLocale, l} = useLocalization();

    const globalBan = findGlobalBan(globalBanId);
    const bannedUser = findUser(globalBan.bannedUserId);
    const bannedBy = findUser(globalBan.createdById);
    const canceledBy = globalBan.canceledById ? findUser(globalBan.canceledById) : undefined;
    const updatedBy = globalBan.updatedById ? findUser(globalBan.updatedById) : undefined;

    return (
        <TableRow>
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
                {globalBan.comment}
            </TableCell>
            <TableCell>
                <UserLink user={bannedBy} displayAvatar/>
            </TableCell>
            <TableCell>
                {globalBan.canceledAt
                    ? format(globalBan.canceledAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : <Remove/>
                }
            </TableCell>
            <TableCell>
                {canceledBy
                    ? <UserLink user={canceledBy} displayAvatar/>
                    : <Remove/>
                }
            </TableCell>
            <TableCell>
                {globalBan.updatedAt
                    ? format(globalBan.updatedAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : <Remove/>
                }
            </TableCell>
            <TableCell>
                {updatedBy
                    ? <UserLink user={updatedBy} displayAvatar/>
                    : <Remove/>
                }
            </TableCell>
        </TableRow>
    );
});
