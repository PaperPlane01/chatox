import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {SearchTextField} from "../../SearchTextField";
import {useStore} from "../../store";
import {isStringEmpty} from "../../utils/string-utils";

export const ChatParticipantSearchTextField: FunctionComponent = observer(() => {
    const {
        chatParticipantsSearch: {
            query,
            isInSearchMode,
            setQuery,
            clearQuery,
            setInSearchMode
        }
    } = useStore();

    if (!isInSearchMode) {
        return null;
    }

    const handleClear = (): void => {
        if (isStringEmpty(query)) {
            setInSearchMode(false);
        } else {
            clearQuery();
        }
    };

    return (
        <SearchTextField value={query}
                         onQueryChange={setQuery}
                         onClear={handleClear}
        />
    );
});