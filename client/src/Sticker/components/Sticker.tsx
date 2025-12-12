import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {BaseStickerProps} from "./BaseStickerProps";
import {ImageSticker} from "./ImageSticker";
import {LottieSticker} from "./LottieSticker";
import {isImageSticker, isLottieSticker, StickerType} from "../../api/types/response";

interface StickerProps extends BaseStickerProps {
    stickerType: StickerType
}

export const Sticker: FunctionComponent<StickerProps> = observer(({
    stickerType,
   ...rest
}) => {
    if (isLottieSticker(stickerType)) {
        return <LottieSticker {...rest}/>
    } else if (isImageSticker(stickerType)) {
        return <ImageSticker {...rest}/>;
    } else {
        return (
            <Typography>
                <em>Unsupported sticker type</em>
            </Typography>
        );
    }
});
