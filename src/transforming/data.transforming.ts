import { AnyObject } from "../common/types"

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
}: TransformDataOptions<T>): any {
    const result: AnyObject = {}

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

            result[key] = runMiddleware(data)
        }
    }

    return result
}

export default transformData