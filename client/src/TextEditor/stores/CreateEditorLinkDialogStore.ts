import {action, makeObservable, observable, reaction} from "mobx";
import {CreateEditorLinkFormData} from "../types";
import {validateUrl} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {containsNotUndefinedValues, createWithUndefinedValues} from "../../utils/object-utils";
import {FormErrors} from "../../utils/types";

const INITIAL_FORM_VALUES: CreateEditorLinkFormData = {
	url: ""
};
const INITIAL_FORM_ERRORS: FormErrors<CreateEditorLinkFormData> = createWithUndefinedValues(
	INITIAL_FORM_VALUES
);

export class CreateEditorLinkDialogStore extends AbstractFormStore<CreateEditorLinkFormData> {
	createLinkDialogOpen = false;

	constructor() {
		super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

		makeObservable<CreateEditorLinkDialogStore, "validateForm">(this, {
			createLinkDialogOpen: observable,
			openCreateLinkDialog: action,
			closeCreateLinkDialog: action,
			validateForm: action
		});

		reaction(
			() => this.formValues.url,
			url => this.setFormError("url", validateUrl(url))
		);
	}

	openCreateLinkDialog = (): void => {
		this.createLinkDialogOpen = true;
	}

	closeCreateLinkDialog = (): void => {
		this.createLinkDialogOpen = false;
	}

	submitForm = (): void => {
		this.validateForm();
	}

	reset = (): void => {
		this.closeCreateLinkDialog();
		this.resetForm();
	}

	protected validateForm(): boolean {
		this.setFormErrors({
			url: validateUrl(this.formValues.url)
		});

		return !containsNotUndefinedValues(this.formErrors);
	}
}
