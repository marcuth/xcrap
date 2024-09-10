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

export type Extractor = (element: HTMLElement) => string

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
    [key: string]: ParsingModelValueBase | ParsingModelNestedValue
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

    private processParsingModel<ParsingModelType extends ParsingModel>(element: HTMLElement, model: ParsingModelType): ResultData<ParsingModelType> {
        const data = {} as ResultData<ParsingModelType>
    
        for (const key in model) {
            const modelValue = model[key] as ParsingModelValue
    
            if ("extractor" in modelValue) {
                const { query, extractor, fieldType } = modelValue
    
                if (query) {
                    if (fieldType === "multiple") {
                        const nestedElements = element.querySelectorAll(query)
                        data[key as keyof ParsingModelType] = nestedElements.map(extractor) as any

                    } else {
                        const nestedElement = element.querySelector(query)

                        if (nestedElement) {
                            data[key as keyof ParsingModelType] = extractor(nestedElement) as any
                        } else {
                            data[key as keyof ParsingModelType] = "" as any
                        }
                    }
                } else {
                    data[key as keyof ParsingModelType] = extractor(element) as any
                }
            } else {
                const { model: nestedParsingModel, query, isGroup } = modelValue as ParsingModelNestedValue
                const nestedElements = element.querySelectorAll(query)

                if (isGroup) {
                    data[key as keyof ParsingModelType] = nestedElements.map(nestedElement => this.processParsingModel(nestedElement, nestedParsingModel)) as any
                } else {
                    const nestedElement = nestedElements[0]
                    data[key as keyof ParsingModelType] = nestedElement ? this.processParsingModel(nestedElement, nestedParsingModel) : {} as any
                }
            }
        }

        return data
    }

    public parseItemGroup<ParsingModelType extends ParsingModel>({
        query,
        model,
        limit
    }: ParseItemGroupOptions<ParsingModelType>): ResultData<ParsingModelType>[] {
        const items = this.document.querySelectorAll(query)

        let dataSet: (undefined | ResultData<ParsingModelType>)[] = items.map((item, index) => {
            if (limit != undefined && index >= limit) return
            const data = this.processParsingModel(item, model)
            return data
        }).filter(item => item !== undefined)

        if (limit != undefined && dataSet.length >= limit) {
            dataSet = dataSet.slice(0, limit)
        }

        return dataSet as ResultData<ParsingModelType>[]
    }

    public parseItem<ParsingModelType extends ParsingModel>({
        model,
        query
    }: ParseItemOptions<ParsingModelType>): ResultData<ParsingModelType> {
        let item: ResultData<ParsingModelType>

        if (query) {
            item = this.parseItemGroup({
                query: query,
                model: model,
                limit: 1
            })[0]
        } else {
            item = this.processParsingModel(this.document, model)
        }

        return item
    }

    public parseAll({
        query,
        extractor,
        limit
    }: ParseAllOptions): string[] {
        const elements = this.document.querySelectorAll(query)

        let dataSet: string[] = []

        for (const element of elements) {
            if (limit != undefined && dataSet.length >= limit) break
            const data = extractor(element)
            dataSet.push(data)
        }

        return dataSet
    }

    public parseOne({
        query,
        extractor
    }: ParseOneOptions): string {
        let data: string

        if (query) {
            data = this.parseAll({
                query: query,
                extractor: extractor,
                limit: 1
            })[0]
        } else {
            data = extractor(this.document)
        }

        return data
    }
}

export default PageParser