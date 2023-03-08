import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {List} from "@mui/material";
import {GlobalBansListItem} from "./GlobalBansListItem";
import {useStore} from "../../store";

export const GlobalBansList: FunctionComponent = observer(() => {
    const {
        globalBansList: {
            globalBanIds
        }
    } = useStore();

    return (
        <List>
            {globalBanIds.map(id => <GlobalBansListItem globalBanId={id} key={id}/>)}
        </List>
    );
});
