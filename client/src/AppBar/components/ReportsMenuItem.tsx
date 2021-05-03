import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, ListItemIcon, ListItemText, makeStyles, MenuItem, Theme} from "@material-ui/core";
import {ArrowDownward, ArrowUpward, ChatBubble, Message, Person, Report} from "@material-ui/icons";
import {useLocalization, useRouter} from "../../store/hooks";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

interface ReportsMenuItemProps {
    onClick: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    },
    nestedMenu: {
        paddingLeft: theme.spacing(2)
    }
}));

export const ReportsMenuItem: FunctionComponent<ReportsMenuItemProps> = observer(({onClick}) => {
    const {l} = useLocalization();
    const routerStore = useRouter();
    const [expanded, setExpanded] = useState(false);
    const classes = useStyles();

    const handleClick = (): void => {
        onClick();
    };

    return (
        <Fragment>
            <MenuItem onClick={() => setExpanded(!expanded)}>
                <ListItemIcon>
                    <Report/>
                </ListItemIcon>
                <ListItemText>
                    {l("reports")}
                </ListItemText>
                {expanded ? <ArrowUpward color="inherit"/> : <ArrowDownward color="inherit"/>}
            </MenuItem>
            {expanded && (
                <div className={classes.nestedMenu}>
                    <Link store={routerStore}
                          className={classes.undecoratedLink}
                          view={Routes.reportedMessages}
                    >
                        <MenuItem onClick={handleClick}>
                            <ListItemIcon>
                                <Message/>
                            </ListItemIcon>
                            <ListItemText>
                                {l("report.drawer.messages")}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                    <Link store={routerStore}
                          className={classes.undecoratedLink}
                          view={Routes.reportedUsers}
                    >
                        <MenuItem onClick={handleClick}>
                            <ListItemIcon>
                                <Person/>
                            </ListItemIcon>
                            <ListItemText>
                                {l("report.drawer.users")}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                    <Link store={routerStore}
                          className={classes.undecoratedLink}
                          view={Routes.reportedChats}
                    >
                        <MenuItem onClick={handleClick}>
                            <ListItemIcon>
                                <ChatBubble/>
                            </ListItemIcon>
                            <ListItemText>
                                {l("report.drawer.chats")}
                            </ListItemText>
                        </MenuItem>
                    </Link>
                </div>
            )}
        </Fragment>
    );
});
