import {action, makeObservable, observable, runInAction} from "mobx";
import {differenceInMilliseconds} from "date-fns";
import {Duration} from "../utils/date-utils";
import {computedFn} from "mobx-utils";

type ExpireCallback<K> = (key: K) => boolean;

export class ExpirableStore<K, V> {
    public readonly storage = observable.map<K, V>();

    constructor(private readonly timeToLive: Duration, private readonly onExpire?: ExpireCallback<K>) {
        makeObservable<ExpirableStore<K, V>>(this, {
            insert: action,
            get: action
        });
    }

    insert = (key: K, value: V): void => {
        this.storage.set(key, value);
        this.initiateDeleteTimeout(key, value);
    }

    private initiateDeleteTimeout = (key: K, value: V): void => {
        const currentDate = new Date();
        const timeoutDuration = differenceInMilliseconds(this.timeToLive.addToDate(currentDate), currentDate);

        setTimeout(() => runInAction(() => {
            const shouldDelete = this.onExpire && this.onExpire(key);

            if (shouldDelete) {
                this.storage.delete(key);
            } else {
                this.insert(key, value);
            }
        }), timeoutDuration);
    }

    get = computedFn((key: K): V | undefined => this.storage.get(key))
}