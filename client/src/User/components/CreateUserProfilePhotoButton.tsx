import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {Image} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const CreateUserProfilePhotoButton: FunctionComponent = observer(() => {
   const {
       userProfilePhotoCreation: {
           setCreateUserProfilePhotoDialogOpen
       },
       userProfilePhotosGallery: {
           setGalleryOpen
       }
   } = useStore();
   const {l} = useLocalization();

   const handleClick = (): void => {
       setCreateUserProfilePhotoDialogOpen(true);
       setGalleryOpen(false);
   };

   return (
       <Button variant="outlined"
               color="primary"
               onClick={handleClick}
       >
           <Image/>
           {l("photo.upload")}
       </Button>
   );
});
