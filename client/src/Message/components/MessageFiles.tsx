import React, {FunctionComponent, Fragment} from "react";
import {MessageFile} from "./MessageFile";

interface MessageFilesProps {
    chatUploadIds: string[]
}

export const MessageFiles: FunctionComponent<MessageFilesProps> = ({chatUploadIds}) => (
    <Fragment>
        {chatUploadIds.map(chatUploadId => (
            <MessageFile key={chatUploadId} chatUploadId={chatUploadId}/>
        ))}
    </Fragment>
);
