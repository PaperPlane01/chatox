import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TextFieldProps} from "@material-ui/core";
import {useStore} from "../../store";
import {SearchTextField} from "../../SearchTextField";

export const ChatsAndMessagesSearchInput: FunctionComponent<TextFieldProps> = observer((props) => {
    const {
        chatsAndMessagesSearchQuery: {
            query,
            searchModeActive,
            setQuery,
            reset
        }
    } = useStore();

    return (
        <SearchTextField {...props}
                         value={query}
                         onQueryChange={setQuery}
                         onClear={reset}
                         hideClearButton={!searchModeActive}
        />
    );
})