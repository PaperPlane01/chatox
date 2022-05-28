import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {GlobalBansTableRow} from "./GlobalBansTableRow";
import {useLocalization, useStore} from "../../store";

export const GlobalBansTable: FunctionComponent = observer(() => {
    const {
        globalBansList: {
            globalBanIds
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Table size="small"
               stickyHeader
        >
            <TableHead>
                <TableRow>
                    <TableCell>{l("global.ban.banned-user")}</TableCell>
                    <TableCell>{l("global.ban.created-at")}</TableCell>
                    <TableCell>{l("global.ban.expires-at")}</TableCell>
                    <TableCell>{l("global.ban.permanent")}</TableCell>
                    <TableCell>{l("global.ban.reason")}</TableCell>
                    <TableCell>{l("global.ban.created-by")}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {globalBanIds.map(id => <GlobalBansTableRow key={id} globalBanId={id}/>)}
            </TableBody>
        </Table>
    );
});
