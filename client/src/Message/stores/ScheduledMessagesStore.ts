import {action} from "mobx";
import {MessagesStore} from "./MessagesStore";

export class ScheduledMessagesStore extends MessagesStore {
    @action
    deleteAllById = (ids: string[]) => {
        this.ids = this.ids.filter(id => !ids.includes(id));
    }

    @action
    deleteById = (idToDelete: string) => {
        const message = this.findByIdOptional(idToDelete);

        if (message) {
            this.ids = this.ids.filter(id => id !== idToDelete);
            delete this.entities[idToDelete];
        }
    }
}
