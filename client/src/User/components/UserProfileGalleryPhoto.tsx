import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Checkbox, ImageListItem, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import clsx from "clsx";
import {useLongPress} from "use-long-press";
import {usePermissions, useStore} from "../../store";
import {ensureEventWontPropagate, isPointerEvent} from "../../utils/event-utils";

const useStyles = makeStyles((theme: Theme) => createStyles({
    imageListItem: {
        position: "relative",
        width: "auto",
        height: "100%"
    },
    image: {
        maxHeight: "100%"
    },
    selected: {
        borderStyle: "solid",
        borderColor: theme.palette.primary.main,
        borderWidth: 5
    },
    checkbox: {
        position: "absolute",
        top: 5,
        right: 5
    }
}))

interface UserProfileGalleryPhotoProps {
    uri: string,
    index: number,
    userProfilePhotoId: string,
    userId: string
}

export const UserProfileGalleryPhoto: FunctionComponent<UserProfileGalleryPhotoProps> = observer(({
    uri,
    index,
    userProfilePhotoId,
    userId
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
   const {
       users: {
           canDeleteProfilePhoto
       }
   } = usePermissions();
   const classes = useStyles();

   const selectable = canDeleteProfilePhoto(userId)
   const selected = isPhotoSelected(userProfilePhotoId);

   const handleSelection = (): void => {
       if (!selectable) {
           return;
       }

       if (selected) {
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
           },
           filterEvents: event => {
               if (isPointerEvent(event)) {
                   return event.button !== 2;
               } else {
                   return true;
               }
           }
       }
   );
   const longPressHandlers = createLongPressHandlers(`userPhoto-${userProfilePhotoId}-handlers`);

   return (
       <ImageListItem className={clsx({
           [classes.imageListItem]: true,
           [classes.selected]: selected
       })}
                      {...longPressHandlers}
       >
           <img src={uri}
                className={classes.image}
           />
           {selectMode && (
               <Checkbox checked={selected}
                         onClick={ensureEventWontPropagate}
                         onChange={handleSelection}
                         className={classes.checkbox}
               />
           )}
       </ImageListItem>
   );
});
