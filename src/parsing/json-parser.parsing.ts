export type JsonParsingModelValueBase = {
    path: string
}

export type JsonParsingModelNestedValue = {
    model: JsonParsingModel
    path?: string
}

export type JsonParsingModelValue = JsonParsingModelValueBase | JsonParsingModelNestedValue;

export type JsonParsingModel = {
    [key: string]: JsonParsingModelValue
}

export type JsonParserResultData<T extends JsonParsingModel> = {
    [K in keyof T]:
    T[K] extends { model: JsonParsingModel } ? JsonParserResultData<T[K]["model"]> : any
}

class JsonParser<T extends any> {
    public readonly dataString: string
    public readonly data: T

    public constructor(dataString: string) {
        this.dataString = dataString
        this.data = JSON.parse(dataString)
    }

    protected getValueByPath(data: any, path: string): any {
        return path.split(".").reduce((obj, key) => obj && obj[key], data);
    }

    protected processParsingModel<JsonParsingModelType extends JsonParsingModel>(
        currentData: any,
        model: JsonParsingModelType
    ): JsonParserResultData<JsonParsingModelType> {
        const result: any = {}

        for (const key in model) {
            const modelValue = model[key]

            if ("model" in modelValue) {
                const nestedData = modelValue.path ? this.getValueByPath(currentData, modelValue.path) : currentData
                result[key] = nestedData !== undefined ? this.processParsingModel(nestedData, modelValue.model) : null
            } else {
                const value = this.getValueByPath(currentData, modelValue.path)
                result[key] = value !== undefined ? value : null
            }
        }

        return result as JsonParserResultData<JsonParsingModelType>
    }

    public parseItem<JsonParsingModelType extends JsonParsingModel>(
        model: JsonParsingModelType
    ): any {
        return this.processParsingModel(this.data, model)
    }

    public parseItemGroup<JsonParsingModelType extends JsonParsingModel>({
        path,
        model,
        limit,
    }: {
        path: string
        model: JsonParsingModelType
        limit?: number
    }): JsonParserResultData<JsonParsingModelType>[] {
        const array = this.getValueByPath(this.data, path)

        if (!Array.isArray(array)) {
            throw new Error(`Invalid JSON path '${path}', it's not an array!`)
        }

        const results: JsonParserResultData<JsonParsingModelType>[] = []

        for (const item of array) {
            results.push(this.processParsingModel(item, model))
            if (limit !== undefined && results.length >= limit) break
        }

        return results
    }

    public parseField(query: string): any {
        return this.getValueByPath(this.data, query)
    }
}

export default JsonParser