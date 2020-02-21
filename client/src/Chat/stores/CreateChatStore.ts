import {observable, action, reaction} from "mobx";
import _ from "lodash";
import {CreateChatFormData} from "../types";
import {ApiError, ChatApi} from "../../api";
import {FormErrors} from "../../utils/types";
import {ChatResponse} from "../../api/types/response";

interface TagErrorsMap {
    [tag: string]: string | undefined
}

interface TagErrorsMapContainer {
    tagErrorsMap: TagErrorsMap
}

export class CreateChatStore {
    @observable
    createChatForm: CreateChatFormData = {
        description: "",
        name: "",
        slug: undefined,
        tags: []
    };

    @observable
    formErrors: FormErrors<CreateChatFormData> & TagErrorsMapContainer = {
        description: undefined,
        name: undefined,
        slug: undefined,
        tags: undefined,
        tagErrorsMap: {}
    };

    @observable
    createdChat?: ChatResponse = undefined;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    pending: boolean = false;
}
