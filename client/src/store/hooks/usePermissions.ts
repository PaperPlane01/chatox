import {useContext} from "react";
import {permissionsContext} from "../context/permissions-context";

export const usePermissions = () => useContext(permissionsContext);