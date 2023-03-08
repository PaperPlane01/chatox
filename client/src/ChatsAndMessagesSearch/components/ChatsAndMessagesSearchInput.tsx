import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TextFieldProps} from "@mui/material";
import {SearchTextField} from "../../SearchTextField";
import {HasRole} from "../../Authorization";
import {useStore} from "../../store";

type ChatsAndMessagesSearchInputProps = TextFieldProps &  {
    alwaysShowClearButton?: boolean
}

export const ChatsAndMessagesSearchInput: FunctionComponent<ChatsAndMessagesSearchInputProps> = observer(({
    alwaysShowClearButton = false,
    ...props
}) => {
    const {
        chatsAndMessagesSearchQuery: {
            query,
            searchModeActive,
            setQuery,
            reset
        }
    } = useStore();

    return (
        <HasRole role="ROLE_ACCESS_TOKEN_PRESENT">
            <SearchTextField value={query as any}
                             onQueryChange={setQuery}
                             onClear={reset}
                             hideClearButton={alwaysShowClearButton ? false : !searchModeActive}
                             variant={props.variant ? props.variant as any : "outlined"}
                             {...props}
            />
        </HasRole>
    );
})