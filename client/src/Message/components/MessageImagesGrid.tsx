import React, {FunctionComponent, memo, useCallback, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import PhotoAlbum, {Photo} from "react-photo-album";
import {Lightbox} from "yet-another-react-lightbox";
import {MessageImagesSimplifiedGrid} from "./MessageImagesSimplifiedGrid";
import {useMessageGalleryWidthMultiplier} from "../hooks";
import {useStore} from "../../store";

interface MessageImagesGridProps {
    imagesIds: string[],
    parentWidth?: number
}

const _MessageImagesGrid: FunctionComponent<MessageImagesGridProps> = observer(({
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
    const parentWidthMultiplier = useMessageGalleryWidthMultiplier();

    const calculateWidth = (): number => {
        let width: number;

        if (parentWidth) {
            width = parentWidth * parentWidthMultiplier - 32
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

    if (imagesIds.length === 1) {
        return <MessageImagesSimplifiedGrid imagesIds={imagesIds} messageId="test"/>
    }

    const images: Photo[] = imagesIds
        .map(id => findImage(id))
        .map(image => ({
            src: `${image.uri}?size=512`,
            height: image.meta!.height,
            width: image.meta!.width,
        }));
    const slides = images
        .map(({src, width, height}) => ({
            src,
            aspectRatio: width / height
        }));

    return (
        <div style={{width: galleryWidth}}>
            <PhotoAlbum photos={images}
                        layout="rows"
                        onClick={(event, photo, index) => openLightbox(index)}
            />
            <Lightbox slides={slides}
                      open={viewerIsOpen}
                      index={currentImage}
                      close={closeLightbox}
            />
        </div>
    );
});

export const MessageImagesGrid = memo(_MessageImagesGrid);
