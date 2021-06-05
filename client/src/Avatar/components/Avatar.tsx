import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Avatar as MuiAvatar} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import {isStringEmpty} from "../../utils/string-utils";
import {useStore} from "../../store";

export interface AvatarProps {
    avatarUri?: string,
    avatarId?: string
    avatarLetter: string,
    avatarColor: string,
    width?: number,
    height?: number,
    pending?: boolean,
    className?: string,
    shape?: "circle" | "rounded" | "square"
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
    shape = "circle"
}) => {
    const {
        entities: {
            uploads: {
                findImage
            }
        }
    } = useStore();

    if (pending) {
        return (
            <Skeleton variant={shape === "circle" || shape === "rounded" ? "circle" : "rect"}
                      width={width}
                      height={height}
            />
        )
    } else {
        const imageProps = {
            width,
            height
        };

        let uri: string | undefined = undefined;

        if (avatarUri) {
            uri = avatarUri;
        } else if (avatarId) {
            const avatar = findImage(avatarId);
            uri = `${avatar.uri}?size=${width >= 256 ? width : 256}`;
        }

        if (isStringEmpty(uri)) {
            return (
                <MuiAvatar style={{
                               backgroundColor: avatarColor,
                               width: imageProps.width,
                               height: imageProps.height
                           }}
                           className={className}
                           variant={shape}
                >
                    {avatarLetter}
                </MuiAvatar>
            )
        } else {
            return (
                <MuiAvatar src={uri}
                           style={{
                               width: imageProps.width,
                               height: imageProps.height
                           }}
                           className={className}
                           variant={shape}
                />
            )
        }
    }
});
