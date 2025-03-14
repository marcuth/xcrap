import htmlParser, { HTMLElement, Options as NodeHtmlParserOptions } from "node-html-parser"

export type HtmlParserResultData<T> = {
    [K in keyof T]: T[K] extends { fieldType: "multiple" }
        ? string[]
        : T[K] extends { model: infer NestedHtmlParsingModel }
        ? T[K] extends { isGroup: true }
            ? HtmlParserResultData<NestedHtmlParsingModel>[]
            : HtmlParserResultData<NestedHtmlParsingModel>
        : string
}

export type Extractor = (element: HTMLElement) => string | Promise<string>

export type HtmlParsingModelValueBase = {
    query?: string
    fieldType?: "single" | "multiple"
    extractor: Extractor
}

export type HtmlParsingModelNestedValue = {
    query: string
    model: HtmlParsingModel
    isGroup?: boolean
}

export type HtmlParsingModelValue = HtmlParsingModelValueBase | HtmlParsingModelNestedValue

export type HtmlParsingModel = {
    [key: string]: HtmlParsingModelValue
}

export type ParseItemGroupOptions<HtmlParsingModelType> = {
    query: string,
    model: HtmlParsingModelType
    limit?: number
}

export type ParseItemOptions<HtmlParsingModelType> = {
    query?: string
    model: HtmlParsingModelType
}

export type ParseManyOptions = {
    query: string
    extractor: Extractor
    limit?: number
}

export type ParseFirstOptions = {
    query?: string
    extractor: Extractor
}

export const defaultHtmlParserOptions = {
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

class HtmlParser {
    public readonly source: string
    public readonly document: HTMLElement

    public constructor(
        source: string,
        options: Partial<NodeHtmlParserOptions> = defaultHtmlParserOptions
    ) {
        this.source = source
        this.document = htmlParser.parse(this.source, options)
    }

    protected async processParsingModel<HtmlParsingModelType extends HtmlParsingModel>(element: HTMLElement, model: HtmlParsingModelType): Promise<HtmlParserResultData<HtmlParsingModelType>> {
        const data = {} as HtmlParserResultData<HtmlParsingModelType>
    
        for (const key in model) {
            const modelValue = model[key] as HtmlParsingModelValue
    
            if ("extractor" in modelValue) {
                const { query, extractor, fieldType } = modelValue
    
                if (query) {
                    if (fieldType === "multiple") {
                        const nestedElements = element.querySelectorAll(query)
                        data[key as keyof HtmlParsingModelType] = await Promise.all(nestedElements.map(extractor)) as any

                    } else {
                        const nestedElement = element.querySelector(query)

                        if (nestedElement) {
                            data[key as keyof HtmlParsingModelType] = await extractor(nestedElement) as any
                        } else {
                            data[key as keyof HtmlParsingModelType] = "" as any
                        }
                    }
                } else {
                    data[key as keyof HtmlParsingModelType] = await extractor(element) as any
                }
            } else {
                const { model: nestedHtmlParsingModel, query, isGroup } = modelValue as HtmlParsingModelNestedValue
                const nestedElements = element.querySelectorAll(query)

                if (isGroup) {
                    data[key as keyof HtmlParsingModelType] = await Promise.all(
                        nestedElements.map(nestedElement => this.processParsingModel(nestedElement, nestedHtmlParsingModel))
                    ) as any
                } else {
                    const nestedElement = nestedElements[0]
                    data[key as keyof HtmlParsingModelType] = nestedElement ? await this.processParsingModel(nestedElement, nestedHtmlParsingModel) : {} as any
                }
            }
        }

        return data
    }

    public async parseItemGroup<HtmlParsingModelType extends HtmlParsingModel>({
        query,
        model,
        limit
    }: ParseItemGroupOptions<HtmlParsingModelType>): Promise<HtmlParserResultData<HtmlParsingModelType>[]> {
        const items = this.document.querySelectorAll(query)

        let dataSet: (undefined | HtmlParserResultData<HtmlParsingModelType>)[] = (
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

        return dataSet as HtmlParserResultData<HtmlParsingModelType>[]
    }

    public async parseItem<HtmlParsingModelType extends HtmlParsingModel>({
        model,
        query
    }: ParseItemOptions<HtmlParsingModelType>): Promise<HtmlParserResultData<HtmlParsingModelType>> {
        let item: HtmlParserResultData<HtmlParsingModelType>

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

    public async parseMany({
        query,
        extractor,
        limit
    }: ParseManyOptions): Promise<string[]> {
        const elements = this.document.querySelectorAll(query)

        let dataSet: string[] = []

        for (const element of elements) {
            if (limit != undefined && dataSet.length >= limit) break
            const data = await extractor(element)
            dataSet.push(data)
        }

        return dataSet
    }

    public async parseFirst({
        query,
        extractor
    }: ParseFirstOptions): Promise<string> {
        let data: string

        if (query) {
            const items = await this.parseMany({
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

export default HtmlParser