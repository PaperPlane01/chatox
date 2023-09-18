import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageListItem} from "@mui/material";
import {useLongPress} from "use-long-press";
import {useStore} from "../../store";

interface UserProfileGalleryPhotoProps {
    uri: string,
    index: number,
    userProfilePhotoId: string
}

export const UserProfileGalleryPhoto: FunctionComponent<UserProfileGalleryPhotoProps> = observer(({
    uri,
    index,
    userProfilePhotoId
}) => {
   const {
       userProfilePhotosGallery: {
           openLightboxToIndex
       },
       selectedUserPhotos: {
           selectMode,
           isPhotoSelected,
           selectPhoto,
           unselectPhoto
       }
   } = useStore();

   const handleSelection = (): void => {
       if (isPhotoSelected(userProfilePhotoId)) {
           unselectPhoto(userProfilePhotoId);
       } else {
           selectPhoto(userProfilePhotoId);
       }
   };

   const createLongPressHandlers = useLongPress(
       handleSelection,
       {
           onCancel: () => {
               if (!selectMode) {
                   openLightboxToIndex(index);
               } else {
                   handleSelection();
               }
           }
       }
   );
   const longPressHandlers = createLongPressHandlers(`userPhoto-${userProfilePhotoId}-handlers`);

   return (
       <ImageListItem {...longPressHandlers}>
           <img src={uri}/>
       </ImageListItem>
   );
});