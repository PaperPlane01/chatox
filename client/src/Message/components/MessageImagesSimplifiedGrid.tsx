import React, {FunctionComponent, useCallback, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {GridList, GridListTile, useTheme, useMediaQuery} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import Carousel, {ModalGateway, Modal} from "react-images";
import {useStore} from "../../store/hooks";
import {ImageUploadMetadata, Upload} from "../../api/types/response";
import {useMessageGalleryWidthMultiplier} from "../hooks";

interface MessageImagesSimplifiedGridProps {
    imagesIds: string[],
    messageId: string,
    parentWidth?: number
}

const getThumbnailCols = (image: Upload<ImageUploadMetadata>, maxCols: number): number => {
    const ratio = image.meta!.height / image.meta!.width;

    if (ratio > 1) {
        return 1;
    }

    const cols = Math.ceil(1 / ratio);

    if (cols > maxCols) {
        return maxCols;
    } else {
        return cols;
    }
}

interface ImagesLoadingStateMap {
    [index: number]: boolean
}

export const MessageImagesSimplifiedGrid: FunctionComponent<MessageImagesSimplifiedGridProps> = observer(({
    imagesIds,
    parentWidth
}) => {
    const {
        entities: {
            uploads: {
                findImage
            }
        }
    } = useStore();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
    const galleryWidthMultiplier = useMessageGalleryWidthMultiplier();
    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [imagesLoadingState, setImagesLoadingState] = useState<ImagesLoadingStateMap>({});

    const calculateTargetOneColWidth = (): number => {
        if (imagesIds.length === 1) {
            if (parentWidth) {
                return galleryWidthMultiplier * parentWidth;
            } else {
                if (onSmallScreen) {
                    return 256;
                } else {
                    return 512;
                }
            }
        } else {
            if (onSmallScreen) {
                return 256;
            } else {
                return 512
            }
        }
    };

    const [targetOneColWidth, setTargetOneColWidth] = useState(calculateTargetOneColWidth());

    useLayoutEffect(
        () => {
            setTargetOneColWidth(calculateTargetOneColWidth())
        },
        [parentWidth]
    );

    const openLightbox = useCallback((index: number) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    const images = imagesIds
        .map(id => findImage(id))
        .map(image => ({
            ...image,
            source: image.uri
        }));

    const maxCols =  4
    const totalCols = imagesIds.length < maxCols ? imagesIds.length : maxCols;

    return (
        <GridList cellHeight={totalCols === 1 ? Math.ceil(images[0].meta!.height * (targetOneColWidth / images[0].meta!.width)) : 180}
                  cols={totalCols}
                  style={{margin: "0px! important"}}
                  spacing={0}
        >
            {images.map((image, index) => (
                <GridListTile cols={getThumbnailCols(image, totalCols)}
                              style={{
                                  cursor: "pointer",
                              }}
                              onClick={() => openLightbox(index)}
                >
                    {!imagesLoadingState[index] && (
                        <Skeleton style={{
                            width: totalCols === 1 ? "100%" : targetOneColWidth * getThumbnailCols(image, maxCols),
                            height: "100%"
                        }}
                                  variant="rect"
                        />
                    )}
                    <img src={`${image.source}?size=512`}
                         style={{
                             display: imagesLoadingState[index] ? "block" : "none"
                         }}
                         onLoad={() => setImagesLoadingState({
                             ...imagesLoadingState,
                             [index]: true
                         })}
                    />
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
