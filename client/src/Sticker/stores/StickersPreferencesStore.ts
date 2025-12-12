import {makeAutoObservable} from "mobx";
import {isInteger} from "lodash";
import {isDefined} from "../../utils/object-utils";

export class StickersPreferencesStore {
	autoplay = true;

	loop = true;

	loopsCount?: number = undefined;

	constructor() {
		makeAutoObservable(this, {}, {autoBind: true});

		[window?.localStorage?.getItem("autoplay")]
			.filter(isDefined)
			.map(value => value === "true")
			.forEach(value => this.autoplay = value);
		[window?.localStorage?.getItem("loop")]
			.filter(isDefined)
			.map(value => value === "true")
			.forEach(value => this.loop = value);
		[window?.localStorage?.getItem("loopsCount")]
			.filter(isDefined)
			.map(loopsCount => Number(loopsCount))
			.filter(loopsCount => !isNaN(loopsCount) && isInteger(loopsCount) && loopsCount >= 0)
			.forEach(loopsCount => this.loopsCount = loopsCount);
	}

	setAutoplay(autoplay: boolean): void {
		this.autoplay = autoplay;
		window?.localStorage?.setItem("autoplay", `${autoplay}`);
	}

	setLoop(loop: boolean): void {
		this.loop = loop;
		window?.localStorage?.setItem("loop", `${loop}`);
	}

	setLoopsCount(loopsCount?: number): void {
		this.loopsCount = loopsCount;

		if (isDefined(loopsCount)) {
			window?.localStorage?.setItem("loopsCount", `${loopsCount}`);
		} else {
			window?.localStorage?.removeItem("loopsCount");
		}
	}
}
