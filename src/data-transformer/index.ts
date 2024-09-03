type AnyObject = {
    [key: string]: any
}

export type NextMiddleware<T, R = any> = (nextContext?: Partial<T & AnyObject>) => R
export type TransformationMiddleware<T extends AnyObject, R = any> = (data: T & AnyObject, next: NextMiddleware<T>) => R

export type TransformationModel<T extends AnyObject = any> = {
    [K in keyof T]?: TransformationMiddleware<T, any>[]
} & {
    [key: string]: TransformationMiddleware<T, any>[]
}

export type TransformDataOptions<T extends AnyObject> = {
    data: T,
    model: TransformationModel<T>
}

function transformData<T extends AnyObject>({
    data,
    model
}: TransformDataOptions<T>): Partial<T> {
    const result: Partial<T> = {}

    for (const key in model) {
        if (model[key]) {
            const middlewares = model[key] as TransformationMiddleware<T>[]
            let index = 0

            const runMiddleware = (value: T & AnyObject): any => {
                if (index < middlewares.length) {
                    const currentMiddleware = middlewares[index]
                    index++

                    return currentMiddleware(
                        value,
                        (nextContext) => runMiddleware({
                            ...value,
                            ...(nextContext ? nextContext : {})
                        })
                    )
                }

                return value
            }

            result[key as keyof T] = runMiddleware(data)
        }
    }

    return result
}

export type CallNextOptions<T extends AnyObject> = {
    middleware: TransformationMiddleware<T>
    resultKey?: string
}

export function callNext<T extends AnyObject>({
    middleware,
    resultKey
}: CallNextOptions<T>) {
    return (data: T & AnyObject, next: NextMiddleware<T>) => {
        const result = middleware(data, () => {})
        const nextContext: Partial<T & AnyObject> = {}

        if (resultKey) {
            nextContext[resultKey as keyof typeof nextContext] = result
        }

        return next(nextContext)
    }
}

export default transformData