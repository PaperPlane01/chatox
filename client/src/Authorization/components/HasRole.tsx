import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {convertStringToUserRole, CurrentUser} from "../../api/types/response";
import {IAppState} from "../../store";

interface HasRoleMobxProps {
    currentUser?: CurrentUser
}

interface HasRoleOwnProps {
    role: "ROLE_ADMIN" | "ROLE_USER" | "ROLE_ANONYMOUS_USER" | "ROLE_NOT_LOGGED_IN",
    additionalCondition?: boolean
}

type HasRoleProps = HasRoleMobxProps & HasRoleOwnProps;

const _HasRole: FunctionComponent<HasRoleProps> = ({
    currentUser,
    role,
    additionalCondition = true,
    children
}) => {
    let shouldRender = false;

    if (role === "ROLE_NOT_LOGGED_IN") {
       shouldRender = currentUser === undefined && additionalCondition;
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
        : null;
};

const mapMobxToProps = (state: IAppState): HasRoleMobxProps => ({
    currentUser: state.authorization.currentUser
});

export const HasRole = inject(mapMobxToProps)(observer(_HasRole as FunctionComponent<HasRoleOwnProps>));
