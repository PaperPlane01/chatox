import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Tooltip} from "@mui/material";
import shortNumber from "short-number";
import {USER_INTERACTIONS_ICONS_MAP} from "./UserInteractionIcons";
import {useLocalization, useStore} from "../../store";
import {UserInteractionType} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";
import {Labels} from "../../localization";

interface CreateUserInteractionButtonProps {
    type: UserInteractionType
}

export const CreateUserInteractionButton: FunctionComponent<CreateUserInteractionButtonProps> = observer(({
    type
}) => {
    const {
        userInteractionCosts: {
            getUserInteractionCost
        },
        userInteractionCreation: {
            createUserInteraction,
            pending
        },
        userInteractionsCount: {
            getInteractionsCount
        }
    } = useStore();
    const {l} = useLocalization();
    const count = getInteractionsCount(type);
    const cost = getUserInteractionCost(type);
    const tooltipLabel = (
        <Fragment>
            <div>
                {l(`user.interaction.${type}.count` as keyof Labels, {count})}
            </div>
            {isDefined(cost) && (
                <div>
                    {l("user.interaction.cost", {cost})}
                </div>
            )}
        </Fragment>
    );

   return (
       <Tooltip title={tooltipLabel}>
           <Button variant="text"
                   color="primary"
                   startIcon={USER_INTERACTIONS_ICONS_MAP[type]}
                   onClick={() => createUserInteraction(type)}
                   disabled={pending}
           >
               {shortNumber(count)}
           </Button>
       </Tooltip>
   );
});