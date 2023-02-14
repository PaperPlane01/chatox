import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import PhotoAlbum, {Photo} from "react-photo-album";
import {Lightbox} from "yet-another-react-lightbox";
import {useStore} from "../../store";

interface MessageImagesGridProps {
    imagesIds: string[],
    messageId: string,
    parentWidth?: number,
    onImagesLoaded?: () => void
}

let heightCache: {[messageId: string]: number} = {};

window.addEventListener("resize", () => heightCache = {});

export const MessageImagesGrid: FunctionComponent<MessageImagesGridProps> = observer(({
    imagesIds,
    messageId,
    onImagesLoaded
}) => {
    const {
        entities: {
            uploads: {
                findImage
            }
        }
    } = useStore();

    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);
    const galleryParentRef = useRef<HTMLDivElement>(null);

    useEffect( () => {
        if (galleryParentRef && galleryParentRef.current && !heightCache[messageId] && loadedImages.length === imagesIds.length) {
            heightCache[messageId] = galleryParentRef.current.getBoundingClientRect().height;

            if (onImagesLoaded) {
                onImagesLoaded();
            }
        }
    });

    const openLightbox = useCallback((index: number) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    const images: Array<Photo & {id: string, actualUrl: string}> = imagesIds
        .map(id => findImage(id))
        .map(image => ({
            id: image.id,
            src: `${image.uri}?size=512`,
            actualUrl: image.uri,
            height: image.meta!.height,
            width: image.meta!.width,
        }));
    const slides = images
        .map(({width, height, actualUrl}) => ({
            src: actualUrl,
            aspectRatio: width / height
        }));

    return (
        <div ref={galleryParentRef}
             style={{height: heightCache[messageId] && heightCache[messageId]}}
        >
            <PhotoAlbum photos={images}
                        layout="rows"
                        onClick={({index}) => openLightbox(index)}
                        rowConstraints={{
                            maxPhotos: 2
                        }}
                        renderPhoto={props => (
                            <img {...props.imageProps}
                                onLoad={async () => {
                                    setLoadedImages([...loadedImages, props.photo.src]);
                                }}
                            />
                        )}
                        spacing={0}
                        padding={0}
            />
            <Lightbox slides={slides}
                      open={viewerIsOpen}
                      index={currentImage}
                      close={closeLightbox}
            />
        </div>
    );
});
