import { NextMiddleware, TransformationMiddleware } from "@transforming/data.transforming"
import { AnyObject } from "@common/types"

export type CallNextOptions<T extends AnyObject> = {
    middleware: TransformationMiddleware<T>
    resultKey?: string
}

export type RunCascadeOptions<T extends AnyObject> = {
    resultKey: string
    middlewares: TransformationMiddleware<T>[]
}

function callNext<NextContext extends AnyObject>({
    middleware,
    resultKey
}: CallNextOptions<NextContext>) {
    return (data: NextContext & AnyObject, next: NextMiddleware<NextContext>) => {
        const result = middleware(data, () => {})
        const nextContext: Partial<NextContext & AnyObject> = {}

        if (resultKey) {
            nextContext[resultKey as keyof typeof nextContext] = result
        }

        return next(nextContext)
    }
}

function getFieldValue(key: string) {
    return (data: AnyObject) => data[key]
}

function runCascade<NextContext extends AnyObject>({
    resultKey,
    middlewares
}: RunCascadeOptions<NextContext>): TransformationMiddleware<NextContext>[] {
    const resultMiddlewares: TransformationMiddleware<NextContext>[] = []

    for (const middleware of middlewares) {
        resultMiddlewares.push(
            callNext({
                middleware,
                resultKey
            })
        )
    }

    resultMiddlewares.push(
        getFieldValue(resultKey)
    )

    return resultMiddlewares
}

export {
    getFieldValue,
    runCascade,
    callNext
}