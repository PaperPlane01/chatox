import React, {FunctionComponent, useCallback, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {ImageList, ImageListItem, useTheme, useMediaQuery, Skeleton} from "@mui/material";
import {Lightbox, SlideImage} from "yet-another-react-lightbox";
import {useStore} from "../../store";
import {ImageUploadMetadata, Upload} from "../../api/types/response";

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
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [imagesLoadingState, setImagesLoadingState] = useState<ImagesLoadingStateMap>({});

    const calculateTargetOneColWidth = (): number => {
        if (onSmallScreen) {
            return 256;
        } else {
            return 512;
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

    const images = imagesIds.map(id => findImage(id))
    const slides: SlideImage[] = images.map(({uri, meta}) => ({
        src: uri,
        aspectRatio: meta!.width / meta!.height
    }));

    const maxCols =  4
    const totalCols = imagesIds.length < maxCols ? imagesIds.length : maxCols;

    return (
        <ImageList rowHeight={totalCols === 1 ? Math.ceil(images[0].meta!.height * (targetOneColWidth / images[0].meta!.width)) : 180}
                  cols={totalCols}
                  style={{margin: "0px! important"}}
                  gap={0}
        >
            {images.map((image, index) => (
                <ImageListItem cols={getThumbnailCols(image, totalCols)}
                              style={{
                                  cursor: "pointer",
                              }}
                              onClick={() => openLightbox(index)}
                >
                    {!imagesLoadingState[index] && (
                        <Skeleton style={{
                            width: targetOneColWidth * getThumbnailCols(image, maxCols),
                            height: "100%"
                        }}
                                  variant="rectangular"
                        />
                    )}
                    <img src={`${image.uri}?size=512`}
                         style={{display: imagesLoadingState[index] ? "block" : "none"}}
                         onLoad={() => setImagesLoadingState({
                             ...imagesLoadingState,
                             [index]: true
                         })}
                    />
                </ImageListItem>
            ))}
            <Lightbox slides={slides}
                      open={viewerIsOpen}
                      index={currentImage}
                      close={closeLightbox}
            />
        </ImageList>
    );
});
