import React, {Component, ComponentType, CSSProperties, PropsWithChildren, ReactNode} from "react";
import {inject, observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../../Layout";
import {Language, TranslationFunction} from "../../localization";
import {replacePlaceholder} from "../../localization/utils";
import {IAppState} from "../../store";

interface ErrorBoundaryMobxProps {
    currentLanguage: Language,
    l: TranslationFunction
}

interface ErrorBoundaryState {
    error?: Error,
    stackTraceExpanded: boolean
}

type ErrorBoundaryTranslations = {
    [key in Language]: ReactNode
}

const chunkLoadErrorTranslation: ErrorBoundaryTranslations = {
    en: (
        <Layout>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography>
                        A new version Chatox has been released. Please refresh your page to get the app working.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        What happened?
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        Chatox uses technique called "Code splitting" which allows to reduce initial load time
                        of the app by loading only required files first, and then loading other files on demand
                        (e.g. when user visits another page).
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        However, during deploy of new version of Chatox old files are destroyed. This is done
                        intentionally to ensure that users have the latest version of the app.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        This may lead to a situation when user who has old version of the app tries to visit a part of the
                        app which hasn't been loaded yet. The app tries to download files, but they got removed from the server.
                        When this happens, you see this message.
                    </Typography>
                </Grid>
            </Grid>
        </Layout>
    ),
    ru: (
        <Layout>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography>
                        Вышла новая версия Chatox. Пожалуйста, обновите страницу, чтобы приложение снова заработало.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Что случилось?
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        Chatox использлует технику, которая называется "Разделение кода". Она позволяет
                        сократить начальное время загрузки приложения путём загрузки только необходимых
                        на данный момент файлов. Остальные файлы загружаются при необходимости (например, когда
                        пользователь заходит на определённую страницу).
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        Однако, во время релиза новой версии Chatox старые файлы удаляются с сервера.
                        Это делается намеренно для того, чтобы у пользователей гарантированно была самая последняя
                        версия приложения.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        Это может привести к ситуации, когда пользователь со старой версией приложения пытается посетить
                        ту часть приложения, которая ещё не была загружена. Приложение пытается загрузить необходимые файлы,
                        но они были удалены с сервера. Когда подобное происходит, вы видите эту ошибку.
                    </Typography>
                </Grid>
            </Grid>
        </Layout>
    )
};

const fatalErrorTranslations: ErrorBoundaryTranslations = {
    en: (
        <Layout>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography>
                        Fatal error occurred. Please reload the page.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        What happened?
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        We don't really know. If you see this error, it means that something
                        unexpected happened, something that we couldn't anticipate.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        It will really help us if you report this error with its stacktrace to us and create an issue in our
                        {" "}
                        <a href="https://github.com/PaperPlane01/chatox/issues" target="_blank">Github repository</a> so
                        we can investigate this error and prevent it from happening.
                    </Typography>
                </Grid>
            </Grid>
        </Layout>
    ),
    ru: (
        <Layout>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography>
                        Произошла критическая ошибка. Пожалуйста, перезагрузите страницу.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        Что случилось?
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        Мы не знаем :( Если вы видите эту ошибку,
                        значит, произошло что-то непредвиденное, что-то, что
                        мы не смогли предусмотреть.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        Вы можете сильно нам помочь, если сообщите об этой ошибке в нашем
                        {" "}
                        <a href="https://github.com/PaperPlane01/chatox/issues" target="_blank">репозитории Github</a> и
                        прикрепите к сообщению стек ошибки. Это поможет нам исследовать данную ошибку
                        и предотвратить её появление в будущем.
                    </Typography>
                </Grid>
            </Grid>
        </Layout>
    )
}

@inject((state: IAppState): ErrorBoundaryMobxProps => ({
    currentLanguage: state.language.selectedLanguage,
    l: (label, bindings) => {
        const currentLanguageLabels = state.language.currentLanguageLabels;
        const targetLabel = currentLanguageLabels[label];

        return replacePlaceholder(targetLabel, bindings);
    }
}))
@observer
class _ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryMobxProps>, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryMobxProps) {
        super(props);

        this.state = {
            error: undefined,
            stackTraceExpanded: false
        }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {error, stackTraceExpanded: false};
    }

    render() {
        const {currentLanguage, l, children} = this.props;
        const {error, stackTraceExpanded} = this.state;

        if (error) {
            const centeredStyle: CSSProperties = {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100%"
            }

            if (error.name === "ChunkLoadError") {
                return (
                    <div style={centeredStyle}>
                        {chunkLoadErrorTranslation[currentLanguage]}
                    </div>
                )
            } else {
                return (
                    <div style={{
                        ...centeredStyle,
                        flexDirection: "column"
                    }}>
                        {fatalErrorTranslations[currentLanguage]}
                        <Grid container spacing={2}>
                            <Layout>
                                <Grid item xs={12}>
                                    <Typography style={{
                                        cursor: "pointer",
                                        textDecoration: "underline"
                                    }}
                                                onClick={() => this.setState({
                                                    stackTraceExpanded: !stackTraceExpanded
                                                })}
                                    >
                                        {stackTraceExpanded
                                            ? l("error-boundary.stacktrace.hide")
                                            : l("error-boundary.stacktrace.show")
                                        }
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {stackTraceExpanded && (
                                        <Typography>
                                            <code>
                                                {error.stack}
                                            </code>
                                        </Typography>
                                    )}
                                </Grid>
                            </Layout>
                        </Grid>
                    </div>
                )
            }
        } else {
            return children;
        }
    }
}

export const ErrorBoundary = _ErrorBoundary as unknown as ComponentType<PropsWithChildren<{}>>;
