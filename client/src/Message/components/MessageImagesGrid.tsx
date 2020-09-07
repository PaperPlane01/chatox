import React, {FunctionComponent, memo, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import Gallery, {PhotoProps} from "react-photo-gallery";
import {useStore} from "../../store/hooks";
import {MessageImagesSimplifiedGridList} from "./MessageImagesSimplifiedGridList";
import {useMediaQuery, useTheme} from "@material-ui/core";

interface MessageImagesGridProps {
    chatUploadsIds: string[],
    parentWidth?: number
}

const _MessageImagesGrid: FunctionComponent<MessageImagesGridProps> = observer(({
    chatUploadsIds,
    parentWidth
}) => {
    const {
        entities: {
            chatUploads: {
                findById: findChatUpload
            },
            uploads: {
                findImage
            }
        }
    } = useStore();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const onMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

    const calculateWidth = (): number => {
        let width: number;
        let multiplier;

        if (onSmallScreen) {
            multiplier = 0.85;
        } else if (onMediumScreen) {
            multiplier = chatUploadsIds.length > 3 ? 0.6 : 0.5;
        } else {
            multiplier = chatUploadsIds.length > 3 ? 0.6 : 0.5;
        }

        if (parentWidth) {
            width = parentWidth * multiplier - 32
        } else {
            width = window.innerWidth / 3.84

            if (width < 250) {
                width = 250;
            }
        }

        return width;
    }

    const [galleryWidth, setGalleryWidth] = useState(calculateWidth())

    useLayoutEffect(
        () => {
            const setWidth = (): void => setGalleryWidth(calculateWidth());

            window.addEventListener("resize", setWidth);

            return () => window.removeEventListener("resize", setWidth);
        }
    );

    useLayoutEffect(
        () => {
            setGalleryWidth(calculateWidth());
        },
        [parentWidth]
    );

    if (chatUploadsIds.length === 1) {
        return <MessageImagesSimplifiedGridList chatUploadsIds={chatUploadsIds} messageId="test"/>
    }

    const images: PhotoProps<{fullSizeUri: string}>[] = chatUploadsIds
        .map(chatUploadId => findChatUpload(chatUploadId))
        .map(chatUpload => findImage(chatUpload.uploadId))
        .map(image => ({
            src: `${image.uri}?size=512`,
            height: image.meta!.height,
            width: image.meta!.width,
            fullSizeUri: image.uri
        }));

    return (
        <div style={{width: galleryWidth}}>
            <Gallery photos={images}
                     margin={0}
                     targetRowHeight={180}
            />
        </div>
    )
})

export const MessageImagesGrid = memo(_MessageImagesGrid);
