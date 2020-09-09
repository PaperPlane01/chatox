import React, {FunctionComponent, memo, useCallback, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@material-ui/core";
import Gallery, {PhotoProps} from "react-photo-gallery";
import Carousel, {Modal, ModalGateway} from "react-images";
import {MessageImagesSimplifiedGrid} from "./MessageImagesSimplifiedGrid";
import {useStore} from "../../store/hooks";

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
            multiplier = 0.6
        } else {
            multiplier = 0.5
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

    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);

    const openLightbox = useCallback((index: number) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    if (chatUploadsIds.length === 1) {
        return <MessageImagesSimplifiedGrid chatUploadsIds={chatUploadsIds} messageId="test"/>
    }

    const images: PhotoProps<{source: string}>[] = chatUploadsIds
        .map(chatUploadId => findChatUpload(chatUploadId))
        .map(chatUpload => findImage(chatUpload.uploadId))
        .map(image => ({
            src: `${image.uri}?size=512`,
            height: image.meta!.height,
            width: image.meta!.width,
            source: image.uri
        }));
    Object.freeze(images);

    return (
        <div style={{width: galleryWidth}}>
            <Gallery photos={images}
                     margin={0}
                     targetRowHeight={180}
                     onClick={(event, {index}) => openLightbox(index)}
                     useParentContainerWidth
                     parentContainerWidth={galleryWidth}
            />
            <ModalGateway>
                {viewerIsOpen
                    ? (
                        <Modal onClose={closeLightbox}>
                            <Carousel
                                currentIndex={currentImage}
                                views={images}
                            />
                        </Modal>
                    )
                    : null
                }
            </ModalGateway>
        </div>
    )
})

export const MessageImagesGrid = memo(_MessageImagesGrid);
