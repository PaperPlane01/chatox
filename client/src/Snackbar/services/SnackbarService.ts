import {VariantType} from "notistack";
import {INTERNAL_ENQUEUE_SNACKBAR} from "../components";

export class SnackbarService {
    public enqueueSnackbar(message: string, variant: VariantType = "default"): void {
        INTERNAL_ENQUEUE_SNACKBAR(message, variant);
    }

    public success(message: string): void {
        this.enqueueSnackbar(message, "success");
    }

    public warn(message: string): void {
        this.enqueueSnackbar(message, "warning");
    }

    public info(message: string): void {
        this.enqueueSnackbar(message, "info");
    }

    public error(message: string): void {
        this.enqueueSnackbar(message, "error")
    }
}