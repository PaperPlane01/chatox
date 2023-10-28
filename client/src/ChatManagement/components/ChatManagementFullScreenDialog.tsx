import React, {FunctionComponent, PropsWithChildren, ReactNode} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {useRouter} from "../../store";
import {Routes} from "../../router";

interface ChatManagementFullScreenDialogProps extends PropsWithChildren {
    open: boolean,
    chatSlug: string,
    title?: ReactNode
}

export const ChatManagementFullScreenDialog: FunctionComponent<ChatManagementFullScreenDialogProps> = observer(({
    open,
    chatSlug,
    title,
    children
}) => {
    const router = useRouter();

    const handleBackClick = (): void => {
        console.log("Going back!")
        router.goTo(Routes.chatManagement, {slug: chatSlug});
    };

   return (
       <Dialog open={open}
               fullScreen
       >
           <DialogTitle>
               <IconButton onClick={handleBackClick}>
                   <ArrowBack/>
               </IconButton>
               {title && title}
           </DialogTitle>
           <DialogContent>
               {children}
           </DialogContent>
       </Dialog>
   ) ;
});