import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {JoinChatByInviteButton} from "./JoinChatByInviteButton";
import {PopularChatsListItem} from "../../Chat";
import {useLocalization, useStore} from "../../store";
import {JoinChatRejectionReason} from "../../api/types/response";
import {Labels, TranslationFunction} from "../../localization";

const getChatInviteUsageRejectedLabel = (
    reason: JoinChatRejectionReason | undefined | null,
    l: TranslationFunction
): string => {
    if (!reason) {
        return l("chat.invite.usage.rejected");
    }

    return l(`chat.invite.usage.rejected.${reason}` as keyof Labels);
};

export const ChatInviteCard: FunctionComponent = observer(() => {
    const {
        chatInvite: {
            chatInvite
        }
    } = useStore();
    const {l} = useLocalization();

    if (!chatInvite)  {
        return null;
    }

    const action = chatInvite.usage.canBeUsed
        ? <JoinChatByInviteButton/>
        : (
            <Typography style={{color: "red", marginLeft: 0}}>
                {getChatInviteUsageRejectedLabel(chatInvite.usage.rejectionReason, l)}
            </Typography>
        );

    return (
        <div style={{width: 420}}>
            <PopularChatsListItem chatId={chatInvite.chat.id}
                                  action={action}
            />
        </div>
    );
});
