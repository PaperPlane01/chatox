import {useContext} from "react";
import {routerContext} from "../context";

export const useRouter = () => useContext(routerContext);
