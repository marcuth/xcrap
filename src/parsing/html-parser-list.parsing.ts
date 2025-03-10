import HtmlParser, { HtmlParsingModel, Extractor, HtmlParserResultData } from "./html-parser.parsing"

export type ParseItemGroupForAllOptions<HtmlParsingModelType> = {
    query: string
    model: HtmlParsingModelType
    limit?: number
}

export type ParseAllOptions = {
    query: string
    extractor: Extractor
    limit?: number
}

class HtmlParserList extends Array<HtmlParser> {
    public async parseItemGroupForAll<HtmlParsingModelType extends HtmlParsingModel>({
        query,
        model,
        limit
    }: ParseItemGroupForAllOptions<HtmlParsingModelType>): Promise<HtmlParserResultData<HtmlParsingModelType>[]> {
        const dataSet: HtmlParserResultData<HtmlParsingModelType>[] = []

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

export default HtmlParserList