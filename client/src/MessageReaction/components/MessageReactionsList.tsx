import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {List} from "@mui/material";
import {MessageReactionsListItem} from "./MessageReactionsListItem";
import {useStore} from "../../store/hooks";
import {useEntitiesSelector} from "../../entities";

export const MessageReactionsList: FunctionComponent = observer(() => {
    const {
        messageReactionsDialog: {
            messageId,
            emojiId
        }
    } = useStore();
    const reactions = useEntitiesSelector(
        "messageReactions",
        entities => {
            if (!messageId) {
                return [];
            }

            if (emojiId) {
                return entities.messageReactions.findByMessageIdAndEmojiId(messageId, emojiId);
            } else  {
                return entities.messageReactions.findByMessageId(messageId);
            }
        }
    );

    if (reactions.length === 0) {
        return null;
    }

    return (
      <List>
          {reactions.map(reaction => (
              <MessageReactionsListItem messageReaction={reaction} key={reaction.id}/>
          ))}
      </List>
    );
});
