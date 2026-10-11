import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useStore} from "../../store/hooks";
import {SearchTextField} from "../../SearchTextField/components";

export const ChatAppBarSearchInput: FunctionComponent = observer(() => {
    const {
        messagesSearch: {
            query,
            setQuery,
            reset
        }
    } = useStore();

    return (
        <SearchTextField value={query}
                         onQueryChange={setQuery}
                         onClear={reset}
                         style={{color: "inherit"}}
        />
    );
});
