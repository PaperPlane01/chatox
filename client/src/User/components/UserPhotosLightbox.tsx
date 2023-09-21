import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Lightbox} from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import {useStore} from "../../store";
import {UserProfilePhotoMenu} from "./UserProfilePhotoMenu";

export const UserPhotosLightbox: FunctionComponent = observer(() => {
    const {
        userProfilePhotosGallery: {
            lightboxOpen,
            currentLightboxIndex,
            lightboxSlides,
            setCurrentLightboxIndex,
            setLightboxOpen
        }
    } = useStore();

    return (
        <Lightbox slides={lightboxSlides}
                  open={lightboxOpen}
                  index={currentLightboxIndex}
                  plugins={[Zoom]}
                  on={{
                      view: ({index}) => setCurrentLightboxIndex(index),
                      exited: () => setLightboxOpen(false)
                  }}
                  toolbar={{
                      buttons: [
                          <UserProfilePhotoMenu/>,
                          "zoom",
                          "close",
                      ]
                  }}
        />
    );
});