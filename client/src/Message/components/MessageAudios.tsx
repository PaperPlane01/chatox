import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AudioPlayerControls} from "../../AudioPlayer";
import {AudioType} from "../../AudioPlayer/types";

interface MessageAudiosProps {
    audios: string[],
    audioType: AudioType
}

export const MessageAudios: FunctionComponent<MessageAudiosProps> = observer(({
    audios,
    audioType
}) => (
    <Fragment>
        {audios.map(uploadId => (
            <AudioPlayerControls audioId={uploadId}
                                 audioType={audioType}
                                 key={uploadId}
            />
        ))}
    </Fragment>
));
