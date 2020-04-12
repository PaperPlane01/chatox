import React, {FunctionComponent} from "react";
import {Avatar as MuiAvatar} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import {isStringEmpty} from "../../utils/string-utils";

interface AvatarProps {
    avatarUri?: string,
    avatarLetter: string,
    avatarColor: string,
    width?: number,
    height?: number,
    pending?: boolean
}

export const Avatar: FunctionComponent<AvatarProps> = ({
    avatarUri,
    avatarLetter,
    avatarColor,
    width = 40,
    height = 40,
    pending
}) => {
    if (pending) {
        return (
            <Skeleton variant="circle"
                      width={width}
                      height={height}
            />
        )
    } else {
        const imageProps = {
            width,
            height
        };

        if (isStringEmpty(avatarUri)) {
            return (
                <MuiAvatar style={{
                               backgroundColor: avatarColor,
                               width: imageProps.width,
                               height: imageProps.height
                           }}
                >
                    {avatarLetter}
                </MuiAvatar>
            )
        } else {
            return (
                <MuiAvatar src={avatarUri}
                           style={{
                               width: imageProps.width,
                               height: imageProps.height
                           }}
                />
            )
        }
    }
};
