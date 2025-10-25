import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {BaseStickerProps} from "./BaseStickerProps";
import {ImageSticker} from "./ImageSticker";
import {LottieSticker} from "./LottieSticker";
import {StickerType, UploadType} from "../../api/types/response";

interface StickerProps extends BaseStickerProps {
    stickerType: StickerType
}

export const Sticker: FunctionComponent<StickerProps> = observer(({
    stickerType,
   ...rest
}) => {
    if (stickerType === UploadType.LOTTIE_STICKER) {
        return <LottieSticker {...rest}/>
    } else if (stickerType === UploadType.IMAGE_STICKER || stickerType === UploadType.WEBP_STICKER) {
        return <ImageSticker {...rest}/>;
    } else {
        return (
            <Typography>
                <em>Unsupported sticker type</em>
            </Typography>
        );
    }
});
