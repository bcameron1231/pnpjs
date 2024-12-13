import { TimelinePipe } from "@pnp/core";
import { Queryable } from "@pnp/queryable";

export function QueryVersion(version:string = "2024-05-01-preview"): TimelinePipe<Queryable> {

    return (instance: Queryable) => {

        instance.on.init(function (this: Queryable) {
            this.query.set("api-version", version);
        });

        return instance;
    };
}
