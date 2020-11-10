import React, {Fragment, FunctionComponent, ReactElement} from "react";
import {observer} from "mobx-react";
import {convertStringToUserRole} from "../../api/types/response";
import {useAuthorization} from "../../store";

interface HasRoleProps {
    role: "ROLE_ADMIN" | "ROLE_USER" | "ROLE_ANONYMOUS_USER" | "ROLE_ACCESS_TOKEN_PRESENT" | "ROLE_NOT_LOGGED_IN",
    additionalCondition?: boolean,
    alternative?: ReactElement
}

export const HasRole: FunctionComponent<HasRoleProps> = observer(({
    role,
    additionalCondition = true,
    children,
    alternative
}) => {
    const {currentUser} = useAuthorization();
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
});
