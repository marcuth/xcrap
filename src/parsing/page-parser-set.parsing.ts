import PageParser, { ParsingModel, Extractor, ResultData } from "./page-parser.parsing"

export type ParseItemGroupForAllOptions<ParsingModelType> = {
    query: string
    model: ParsingModelType
    limit?: number
}

export type ParseAllOptions = {
    query: string
    extractor: Extractor
    limit?: number
}

class PageParserSet extends Array<PageParser> {
    public async parseItemGroupForAll<ParsingModelType extends ParsingModel>({
        query,
        model,
        limit
    }: ParseItemGroupForAllOptions<ParsingModelType>): Promise<ResultData<ParsingModelType>[]> {
        const dataSet: ResultData<ParsingModelType>[] = []

        for (const page of this) {
            const adjustedLimit = limit !== undefined && limit !== null ? limit - this.length : limit

            const currentDataSet = await page.parseItemGroup({
                model: model,
                query: query,
                limit: adjustedLimit
            })

            dataSet.push(...currentDataSet)
        }

        return dataSet
    }

    public async parseAll({
        query,
        extractor,
        limit
    }: ParseAllOptions): Promise<string[]> {
        const dataSet: string[] = []

        for (const page of this) {
            if (limit !== undefined && limit !== null && this.length >= limit) break

            const adjustedLimit = limit !== undefined && limit !== null ? limit - this.length : limit

            const currentDataSet = await page.parseAll({
                query: query,
                extractor: extractor,
                limit: adjustedLimit
            })

            dataSet.push(...currentDataSet)
        }

        return dataSet
    }
}

export default PageParserSet