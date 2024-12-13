import { TimelinePipe } from "@pnp/core";
import { InjectHeaders, Queryable, RejectOnError, ResolveOnData } from "@pnp/queryable";

export function DefaultInit(): TimelinePipe<Queryable> {

    return (instance: Queryable) => {

        instance.using(
            RejectOnError(),
            ResolveOnData());
            
        return instance;
    };
}

export function DefaultHeaders(): TimelinePipe<Queryable> {

    return (instance: Queryable) => {

        instance
            .using(InjectHeaders({
                "Accept": "application/json",
                "Content-Type": "application/json;charset=utf-8",
            }));

        return instance;
    };
}