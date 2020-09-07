import React, {FunctionComponent, useCallback, useState} from "react";
import {observer} from "mobx-react";
import {GridList, GridListTile, useTheme, useMediaQuery} from "@material-ui/core";
import Carousel, {ModalGateway, Modal} from "react-images";
import {useStore} from "../../store/hooks";
import {ImageUploadMetadata, Upload} from "../../api/types/response";

interface MessageImagesGridListProps {
    chatUploadsIds: string[],
    messageId: string
}

const getThumbnailCols = (image: Upload<ImageUploadMetadata>, maxCols: number): number => {
    const ratio = image.meta!.height / image.meta!.width;

    if (ratio > 1) {
        return 1;
    }

    const cols = Math.round(1 / ratio);

    if (cols > maxCols) {
        return maxCols;
    } else {
        return cols;
    }
}

export const MessageImagesSimplifiedGridList: FunctionComponent<MessageImagesGridListProps> = observer(({
    chatUploadsIds,
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
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
    const targetOneColWidth = onSmallScreen ? 256 : 400;
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

    const images = chatUploadsIds
        .map(chatUploadId => findChatUpload(chatUploadId))
        .map(chatUpload => findImage(chatUpload.uploadId))
        .map(image => ({
            ...image,
            source: image.uri
        }));

    const totalCols = chatUploadsIds.length < 4 ? chatUploadsIds.length : 4;

    return (
        <GridList cellHeight={totalCols === 1 ? (images[0].meta!.height * (targetOneColWidth / images[0].meta!.width)) : 180}
                  cols={totalCols}
                  style={{margin: "0px! important"}}
                  spacing={0}
        >
            {images.map((image, index) => (
                <GridListTile cols={getThumbnailCols(image, totalCols)}
                              style={{cursor: "pointer"}}
                              onClick={() => openLightbox(index)}
                >
                    <img src={`${image.source}?size=${totalCols === 1 ? targetOneColWidth : 512}`}/>
                </GridListTile>
            ))}
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
        </GridList>
    )
})
