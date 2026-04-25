import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Skeleton} from "@mui/material";
import {ImageAvatar} from "./ImageAvatar";
import {LetterAvatar} from "./LetterAvatar";
import {ExternalImageAvatar} from "./ExternalImageAvatar";
import {isStringEmpty} from "../../utils/string-utils";

export interface AvatarProps {
    avatarUri?: string,
    avatarId?: string
    avatarLetter: string,
    avatarColor: string,
    width?: number | string,
    height?: number | string,
    pending?: boolean,
    className?: string,
    shape?: "circular" | "rectangular" | "square" | "rounded",
    onCLick?: () => void
}

export const Avatar: FunctionComponent<AvatarProps> = observer(({
    avatarUri,
    avatarId,
    avatarLetter,
    avatarColor,
    width = 40,
    height = 40,
    pending,
    className,
    shape = "circular",
    onCLick
}) => {
    const avatarVariant = shape === "rectangular" ? "square" : shape;

    if (pending) {
        return (
            <Skeleton variant={shape === "circular" || shape === "rounded" ? "circular" : "rectangular"}
                      width={width}
                      height={height}
            />
        )
    } else if (avatarId) {
        return (
            <ImageAvatar avatarId={avatarId}
                         width={width}
                         height={height}
                         className={className}
                         variant={avatarVariant}
                         onClick={onCLick}
            />
        );
    } else if (isStringEmpty(avatarUri)) {
           return (
               <LetterAvatar letter={avatarLetter}
                             color={avatarColor}
                             width={width}
                             height={height}
                             className={className}
                             variant={avatarVariant}
                             onClick={onCLick}
               />
           )
    } else {
        return (
            <ExternalImageAvatar externalUri={avatarUri!}
                                 width={width}
                                 height={height}
                                 className={className}
                                 variant={avatarVariant}
                                 onClick={onCLick}
            />
        );
    }
});
