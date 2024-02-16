import React, {ReactNode} from "react";
import {Favorite, ThumbDown, ThumbUp} from "@mui/icons-material";
import {UserInteractionType} from "../../api/types/response";

type UserInteractionsIconsMap = {
    [type in UserInteractionType]: ReactNode
};

export const USER_INTERACTIONS_ICONS_MAP: UserInteractionsIconsMap = {
    [UserInteractionType.LIKE]: <ThumbUp/>,
    [UserInteractionType.DISLIKE]: <ThumbDown/>,
    [UserInteractionType.LOVE]: <Favorite/>
};