type FilterOutAttributes<Base> = {
    [Key in keyof Base]: Base[Key] extends (...any: any[]) => any ? Base[Key] : never;
}

type PromisifyFunction<Function extends (...any: any[]) => any> =
    (...args: Parameters<Function>) => Promise<ReturnType<Function>>;

type PromisifyObject<Base extends {[key: string]: (...any: any[]) => any}> = {
    [Key in keyof Base]: ReturnType<Base[Key]> extends Promise<any> ?
        Base[Key] :
        PromisifyFunction<Base[Key]>;
}

export type Promisify<Base extends {[key: string]: (...any: any[]) => any}> = PromisifyObject<FilterOutAttributes<Base>>;

