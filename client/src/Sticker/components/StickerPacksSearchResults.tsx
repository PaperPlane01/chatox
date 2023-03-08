import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Card, CardHeader, CardContent, CardActions, List, TextField} from "@mui/material";
import {StickerPacksListItem} from "./StickerPacksListItem";
import {useStore, useLocalization} from "../../store";

export const StickerPacksSearchResults: FunctionComponent = observer(() => {
    const {
        stickerPacksSearch: {
            name,
            pending,
            searchResults,
            setName,
            searchStickerPacks
        },
        stickerPackDialog: {
            setStickerPackId
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("sticker.pack.list")}/>
            <CardContent>
                <TextField label="Search"
                           value={name}
                           onChange={event => setName(event.target.value)}
                           fullWidth
                           margin="dense"
                />
                <List>
                    {searchResults.map(stickerPackId => (
                        <StickerPacksListItem stickerPackId={stickerPackId}
                                              key={stickerPackId}
                                              onClick={() => setStickerPackId(stickerPackId)}
                        />
                    ))}
                </List>
                {pending && <CircularProgress color="primary" size={50}/>}
            </CardContent>
            {searchResults.length !== 0 && (
                <CardActions>
                    <Button variant="outlined"
                            color="primary"
                            disabled={pending}
                            onClick={searchStickerPacks}
                    >
                        {l("common.load-more")}
                    </Button>
                </CardActions>
            )}
        </Card>
    );
});
