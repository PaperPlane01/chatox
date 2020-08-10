import {useContext} from "react";
import {authorizationContext} from "../context";

export const useAuthorization = () => useContext(authorizationContext);
