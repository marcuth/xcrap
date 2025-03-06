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

async function transformData<T extends AnyObject>({
    data,
    model
}: TransformDataOptions<T>): Promise<any> {
    const result: AnyObject = {}

    for (const key in model) {
        if (model[key]) {
            const middlewares = model[key] as TransformationMiddleware<T>[]
            let index = 0

            const runMiddleware = async (value: T & AnyObject): Promise<any> => {
                if (index < middlewares.length) {
                    const currentMiddleware = middlewares[index]
                    index++

                    const nextValue = await currentMiddleware(
                        value,
                        async (nextContext) => runMiddleware({
                            ...value,
                            ...(nextContext ? nextContext : {})
                        })
                    )

                    return nextValue
                }

                return value
            }

            result[key] = await runMiddleware(data)
        }
    }

    return result
}

export default transformData