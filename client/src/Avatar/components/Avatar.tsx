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
    width,
    height,
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
        const imageProps = (width && height)
            ?
            {
                width: `${width} px`,
                height: `${height} px`
            }
            :
            {
                width: "100%",
                height: "100%"
            };

        if (isStringEmpty(avatarUri)) {
            return (
                <MuiAvatar imgProps={imageProps}
                           style={{
                               backgroundColor: avatarColor
                           }}
                >
                    {avatarLetter}
                </MuiAvatar>
            )
        } else {
            return (
                <MuiAvatar src={avatarUri}
                           imgProps={imageProps}
                />
            )
        }
    }
};
