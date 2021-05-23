import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AudioPlayerControls} from "../../AudioPlayer";

interface MessageAudiosProps {
    audios: string[]
}

export const MessageAudios: FunctionComponent<MessageAudiosProps> = observer(({
    audios
}) => (
    <Fragment>
        {audios.map(uploadId => (
            <Fragment key={uploadId}>
                <AudioPlayerControls audioId={uploadId}/>
            </Fragment>
        ))}
    </Fragment>
));
