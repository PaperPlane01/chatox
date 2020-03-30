import React, {Fragment, FunctionComponent, ReactElement} from "react";
import {inject, observer} from "mobx-react";
import {convertStringToUserRole, CurrentUser} from "../../api/types/response";
import {IAppState} from "../../store";

interface HasRoleMobxProps {
    currentUser?: CurrentUser
}

interface HasRoleOwnProps {
    role: "ROLE_ADMIN" | "ROLE_USER" | "ROLE_ANONYMOUS_USER" | "ROLE_ACCESS_TOKEN_PRESENT" | "ROLE_NOT_LOGGED_IN",
    additionalCondition?: boolean,
    alternative?: ReactElement
}

type HasRoleProps = HasRoleMobxProps & HasRoleOwnProps;

const _HasRole: FunctionComponent<HasRoleProps> = ({
    currentUser,
    role,
    additionalCondition = true,
    children,
    alternative
}) => {
    let shouldRender = false;

    if (role === "ROLE_NOT_LOGGED_IN") {
       shouldRender = currentUser === undefined && additionalCondition;
    } else if (role === "ROLE_ACCESS_TOKEN_PRESENT") {
        shouldRender = Boolean(localStorage.getItem("accessToken"));
    } else {
        shouldRender = currentUser !== undefined
            && currentUser.roles.includes(convertStringToUserRole(role))
            && additionalCondition;
    }

    return shouldRender
        ? (
            <Fragment>
                {children}
            </Fragment>
        )
        : alternative ? alternative : null;
};

const mapMobxToProps = (state: IAppState): HasRoleMobxProps => ({
    currentUser: state.authorization.currentUser,
});

export const HasRole = inject(mapMobxToProps)(observer(_HasRole as FunctionComponent<HasRoleOwnProps>));
