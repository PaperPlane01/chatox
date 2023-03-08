import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography, TypographyProps} from "@mui/material";
import {ChatDeletionReason} from "../../api/types/response";
import {useLocalization} from "../../store";
import {Labels, TranslationFunction} from "../../localization";
import {isStringEmpty} from "../../utils/string-utils";

interface ChatDeletionLabelProps extends TypographyProps {
    deletionReason?: ChatDeletionReason,
    deletionComment?: string,
    className?: string
}

const getChatDeletionLabel = (l: TranslationFunction, chatDeletionReason?: ChatDeletionReason, chatDeletionComment?: string): string => {
    if (chatDeletionReason) {
        if (!isStringEmpty(chatDeletionComment)) {
            return l("chat.deleted.with-reason-and-comment", {
                reason: l(`chat.delete.reason.${chatDeletionReason}` as keyof Labels),
                comment: chatDeletionComment
            });
        } else {
            return l("chat.deleted.with-reason", {
                reason: l(`chat.delete.reason.${chatDeletionComment}` as keyof Labels)
            });
        }
    } else {
        return l("chat.deleted.by-creator");
    }
};

export const ChatDeletionLabel: FunctionComponent<ChatDeletionLabelProps> = observer(({
    deletionComment,
    deletionReason,
    className
}) => {
    const {l} = useLocalization();

    return (
        <div className={className}>
            <Typography>
                {getChatDeletionLabel(l, deletionReason, deletionComment)}
            </Typography>
        </div>
    );
});