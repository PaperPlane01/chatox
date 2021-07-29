import React, {FunctionComponent, ReactNode, Fragment} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, Typography, List} from "@material-ui/core";
import {StickerPacksListItem} from "./StickerPacksListItem";
import {useStore, useLocalization, useRouter} from "../../store";
import {Language} from "../../localization";
import {Routes} from "../../router";

const {Link} = require("mobx-router")

const noStickerPacksTranslations: {[language in Language]: (routerStore: any) => ReactNode} = {
    en: routerStore => (
        <Typography>
            You don't have any installed sticker packs.
            <Link view={Routes.stickerPacks}
                  store={routerStore}
            >
                Click here to explore sticker packs
            </Link>
            .
        </Typography>
    ),
    ru: routerStore => (
        <Typography>
            У вас нет установленных наборов стикеров.
            <Link view={Routes.stickerPacks}
                  store={routerStore}
            >
                Найти набор стикеров по вкусу
            </Link>
        </Typography>
    )
};

export const InstalledStickerPacksList: FunctionComponent = observer(() => {
    const {
        installedStickerPacks: {
            installedStickerPacksIds
        },
        stickerPackDialog: {
            setStickerPackId
        }
    } = useStore();
    const routerStore = useRouter();
    const {l, locale} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("sticker.pack.list.installed")}/>
            <CardContent>
                {installedStickerPacksIds.length === 0
                    ? noStickerPacksTranslations[locale](routerStore)
                    : (
                        <Fragment>
                            <List>
                                {installedStickerPacksIds.map(stickerPackId => (
                                    <StickerPacksListItem stickerPackId={stickerPackId}
                                                          key={stickerPackId}
                                                          onClick={() => setStickerPackId(stickerPackId)}
                                    />
                                ))}
                            </List>
                            <Typography>
                                <Link view={Routes.stickerPacks}
                                      store={routerStore}
                                >
                                    {l("sticker.pack.explore-more")}
                                </Link>
                            </Typography>
                        </Fragment>
                    )
                }
            </CardContent>
        </Card>
    )
})
