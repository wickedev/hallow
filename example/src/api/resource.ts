import { Optional } from "./utils";

export enum Status {
    PENDING,
    FULLFILED,
    REJECTED
}

type PromiseFactory<T> = (...args: any[]) => Promise<T>;

type ForceUpdate = () => void;

export class Resource<T> {
    public status: Status = Status.PENDING;
    public forceUpdate: Optional<ForceUpdate>;
    public arguments: Optional<IArguments>;
    public mustBeIgnored: boolean = true

    private result: Optional<T>;
    private suspender: Optional<Promise<void>>;

    constructor(
        private readonly factory: PromiseFactory<T>
    ) {
    }

    public get canFetch(): boolean {
        return !this.mustBeIgnored
            || this.status === Status.FULLFILED
            || this.status === Status.REJECTED;
    }

    public read() {
        if (!this.suspender) {
            this.fetch();
        }


        switch (this.status) {
            case Status.PENDING:
                throw this.suspender;
            case Status.REJECTED:
                throw this.result;
            case Status.FULLFILED:
                return this.result;
        }
    }

    public refresh() {
        if (!this.canFetch) {
            return
        }

        this.status = Status.PENDING;
        this.suspender = undefined;
        this.result = undefined;
        this.fetch();
        this.forceUpdate?.();
    }

    private fetch() {
        const args = (this.arguments || []) as any[]
        this.suspender = this.factory(...args)
            .then(
                r => {
                    this.status = Status.FULLFILED;
                    this.result = r;
                },
                e => {
                    this.status = Status.REJECTED;
                    this.result = e;
                }
            );
    }
}
