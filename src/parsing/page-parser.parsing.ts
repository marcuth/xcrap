import htmlParser, { HTMLElement, Options as NodeHtmlParserOptions } from "node-html-parser"

export type ResultData<T> = {
    [K in keyof T]: T[K] extends { fieldType: "multiple" }
        ? string[]
        : T[K] extends { model: infer NestedParsingModel }
        ? T[K] extends { isGroup: true }
            ? ResultData<NestedParsingModel>[]
            : ResultData<NestedParsingModel>
        : string
}

export type Extractor = (element: HTMLElement) => string | Promise<string>

export type ParsingModelValueBase = {
    query?: string
    fieldType?: "single" | "multiple"
    extractor: Extractor
}

export type ParsingModelNestedValue = {
    query: string
    model: ParsingModel
    isGroup?: boolean
}

export type ParsingModelValue = ParsingModelValueBase | ParsingModelNestedValue

export type ParsingModel = {
    [key: string]: ParsingModelValue
}

export type ParseItemGroupOptions<ParsingModelType> = {
    query: string,
    model: ParsingModelType
    limit?: number
}

export type ParseItemOptions<ParsingModelType> = {
    query?: string
    model: ParsingModelType
}

export type ParseAllOptions = {
    query: string
    extractor: Extractor
    limit?: number
}

export type ParseOneOptions = {
    query?: string
    extractor: Extractor
}

export const defaultPageParseOptions = {
    lowerCaseTagName: false,
    comment: false,
    fixNestedATags: true,
    parseNoneClosedTags: true,
    voidTag: {
        tags: ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"],
        closingSlash: true
    },
    blockTextElements: {
        script: true,
        noscript: true,
        style: true,
        pre: true
    }
}

class PageParser {
    public readonly source: string
    public readonly document: HTMLElement

    public constructor(
        source: string,
        options: Partial<NodeHtmlParserOptions> = defaultPageParseOptions
    ) {
        this.source = source
        this.document = htmlParser.parse(this.source, options)
    }

    private async processParsingModel<ParsingModelType extends ParsingModel>(element: HTMLElement, model: ParsingModelType): Promise<ResultData<ParsingModelType>> {
        const data = {} as ResultData<ParsingModelType>
    
        for (const key in model) {
            const modelValue = model[key] as ParsingModelValue
    
            if ("extractor" in modelValue) {
                const { query, extractor, fieldType } = modelValue
    
                if (query) {
                    if (fieldType === "multiple") {
                        const nestedElements = element.querySelectorAll(query)
                        data[key as keyof ParsingModelType] = await Promise.all(nestedElements.map(extractor)) as any

                    } else {
                        const nestedElement = element.querySelector(query)

                        if (nestedElement) {
                            data[key as keyof ParsingModelType] = await extractor(nestedElement) as any
                        } else {
                            data[key as keyof ParsingModelType] = "" as any
                        }
                    }
                } else {
                    data[key as keyof ParsingModelType] = await extractor(element) as any
                }
            } else {
                const { model: nestedParsingModel, query, isGroup } = modelValue as ParsingModelNestedValue
                const nestedElements = element.querySelectorAll(query)

                if (isGroup) {
                    data[key as keyof ParsingModelType] = await Promise.all(
                        nestedElements.map(nestedElement => this.processParsingModel(nestedElement, nestedParsingModel))
                    ) as any
                } else {
                    const nestedElement = nestedElements[0]
                    data[key as keyof ParsingModelType] = nestedElement ? await this.processParsingModel(nestedElement, nestedParsingModel) : {} as any
                }
            }
        }

        return data
    }

    public async parseItemGroup<ParsingModelType extends ParsingModel>({
        query,
        model,
        limit
    }: ParseItemGroupOptions<ParsingModelType>): Promise<ResultData<ParsingModelType>[]> {
        const items = this.document.querySelectorAll(query)

        let dataSet: (undefined | ResultData<ParsingModelType>)[] = (
            await Promise.all(
                items.map(async (item, index) => {
                    if (limit != undefined && index >= limit) return
                    const data = await this.processParsingModel(item, model)
                    return data
                })
            )
        ).filter(item => item !== undefined)

        if (limit != undefined && dataSet.length >= limit) {
            dataSet = dataSet.slice(0, limit)
        }

        return dataSet as ResultData<ParsingModelType>[]
    }

    public async parseItem<ParsingModelType extends ParsingModel>({
        model,
        query
    }: ParseItemOptions<ParsingModelType>): Promise<ResultData<ParsingModelType>> {
        let item: ResultData<ParsingModelType>

        if (query) {
            const items = await this.parseItemGroup({
                query: query,
                model: model,
                limit: 1
            })

            item = items[0]
        } else {
            item = await this.processParsingModel(this.document, model)
        }

        return item
    }

    public async parseAll({
        query,
        extractor,
        limit
    }: ParseAllOptions): Promise<string[]> {
        const elements = this.document.querySelectorAll(query)

        let dataSet: string[] = []

        for (const element of elements) {
            if (limit != undefined && dataSet.length >= limit) break
            const data = await extractor(element)
            dataSet.push(data)
        }

        return dataSet
    }

    public async parseOne({
        query,
        extractor
    }: ParseOneOptions): Promise<string> {
        let data: string

        if (query) {
            const items = await this.parseAll({
                query: query,
                extractor: extractor,
                limit: 1
            })

            data = items[0]
        } else {
            data = await extractor(this.document)
        }

        return data
    }
}

export default PageParser