import React, {Fragment, FunctionComponent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {useStore} from "../../store/hooks";
import {AudioPlayerControls} from "../../AudioPlayer/components";

interface MessageAudiosProps {
    audios: string[]
}

export const MessageAudios: FunctionComponent<MessageAudiosProps> = observer(({
    audios
}) => {
    const {
        entities: {
            chatUploads: {
                findById: findChatUpload
            },
            uploads: {
                findAudio
            }
        }
    } = useStore();
    const ref = useRef(null);
    const [playerContainerRendered, setPlayerContainerRendered] = useState(false);

    useEffect(
        () => {
            setPlayerContainerRendered(Boolean(ref && ref.current));
        },
        [playerContainerRendered]
    )

    useEffect(
        () => {
            console.log(ref);
        },
        [ref]
    )

    const audioUploads = audios
        .map(id => findChatUpload(id))
        .map(chatUpload => findAudio(chatUpload.uploadId));

    return (
        <Fragment>
            {audioUploads.map(upload => (
                <Fragment key={upload.id}>
                    <AudioPlayerControls audioId={upload.id}/>
                </Fragment>
            ))}
        </Fragment>
    )
})
