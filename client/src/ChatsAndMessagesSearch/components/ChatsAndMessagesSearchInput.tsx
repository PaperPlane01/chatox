import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TextFieldProps} from "@mui/material";
import {useStore} from "../../store";
import {SearchTextField} from "../../SearchTextField";

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
        <SearchTextField value={query as any}
                         onQueryChange={setQuery}
                         onClear={reset}
                         hideClearButton={alwaysShowClearButton ? false : !searchModeActive}
                         variant={props.variant ? props.variant as any : "outlined"}
                         {...props}
        />
    );
})