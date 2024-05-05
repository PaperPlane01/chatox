import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme} from "@mui/material";
import {keyframes, styled} from "@mui/material/styles";
import {ModeEdit} from "@mui/icons-material";
import {UserEntity} from "../../User";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";
import {useEntitiesByIds} from "../../entities";

const TypingIndicatorContainer = styled("div")(({theme}: {theme: Theme}) => ({
    display: "flex",
    alignItems: "center",
    paddingRight: theme.spacing(1)
}));

const typingAnimation = keyframes`
    0% {
      opacity: 0;
    }
  
    50% {
      opacity: 0.8;
    }
  
    100% {
      opacity: 0;
    }
`;

const TypingDot = styled("div")(({theme}: {theme: Theme}) =>({
    float: "left",
    width: theme.spacing(1),
    height: theme.spacing(1),
    background: theme.palette.text.secondary,
    borderRadius: "50%",
    opacity: 0,
    animation: `${typingAnimation} 1s infinite ease`,
    alignSelf: "center",
    "&:nth-child(1)": {
        animationDelay: "0s"
    },
    "&:nth-child(2)": {
        animationDelay: "0.2s"
    },
    "&:nth-child(3)": {
        animationDelay: "0.4s"
    }
}));

const getTypingLabel = (typingUsers: UserEntity[], l: TranslationFunction): string => {
    if (typingUsers.length === 1) {
        return l("user.typing", {username: typingUsers[0].firstName});
    } else if (typingUsers.length <= 3) {
        const usernames = typingUsers
            .map(user => user.firstName)
            .reduce((accumulator, current) => `${accumulator}, ${current}`);

        return l("user.typing.plural", {usernames});
    } else {
        const usernames = typingUsers
            .slice(0, 3)
            .map(user => user.firstName)
            .reduce((accumulator, current) => `${accumulator}, ${current}`);
        const count = typingUsers.length = usernames.length;

        return l("user.typing.many", {usernames, count});
    }
};

interface TypingIndicatorProps {
    chatId: string
}

export const TypingIndicator: FunctionComponent<TypingIndicatorProps> = observer(({
    chatId
}) => {
    const {
        typingUsers: {
            getTypingUsersIds
        }
    } = useStore();
    const {l} = useLocalization();

    const typingUsersIds = getTypingUsersIds(chatId);
    const typingUsers = useEntitiesByIds("users", typingUsersIds);

    if (typingUsers.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <ModeEdit fontSize="small"
                      sx={(theme: Theme) => ({
                          paddingRight: theme.spacing(1)
                      })}
            />
            <TypingIndicatorContainer>
                <TypingDot/>
                <TypingDot/>
                <TypingDot/>
            </TypingIndicatorContainer>
            {getTypingLabel(typingUsers, l)}
        </Fragment>
    );
});
