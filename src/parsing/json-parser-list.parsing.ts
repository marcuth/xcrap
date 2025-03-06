import JsonParser, { JsonParsingModel, JsonParserResultData } from "./json-parser.parsing"


export type ParseItemGroupForAllOptions<JsonParsingModelType> = {
    path: string
    model: JsonParsingModelType
    limit?: number
}

export type ParseAllOptions = {
    path: string
    limit?: number
}

class JsonParserList<T> extends Array<JsonParser<T>> {
    public parseItemGroupForAll<JsonParsingModelType extends JsonParsingModel>({
        path,
        model,
        limit,
    }: ParseItemGroupForAllOptions<JsonParsingModelType>): JsonParserResultData<JsonParsingModelType>[] {
        const dataSet: JsonParserResultData<JsonParsingModelType>[] = []

        for (const parser of this) {
            const adjustedLimit = limit !== undefined ? limit - dataSet.length : limit
            const currentDataSet = parser.parseItemGroup({ path, model, limit: adjustedLimit })
            dataSet.push(...currentDataSet)

            if (limit !== undefined && dataSet.length >= limit) break
        }

        return dataSet
    }

    public parseAll({ path, limit }: ParseAllOptions): any[] {
        const dataSet: any[] = []

        for (const parser of this) {
            if (limit !== undefined && dataSet.length >= limit) break

            const adjustedLimit = limit !== undefined ? limit - dataSet.length : undefined
            const value = parser.parseField(path)

            if (Array.isArray(value)) {
                dataSet.push(...(adjustedLimit ? value.slice(0, adjustedLimit) : value))
            } else {
                dataSet.push(value)
            }
        }

        return dataSet
    }
}

export default JsonParserList
