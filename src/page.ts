import htmlParser, { HTMLElement } from "node-html-parser"

export type ItemValue = string | Item | Item[]

export type Item = {
    [key: string]: ItemValue
}

export type Extractor = (element: HTMLElement) => string

export type ModelValue = {
    query?: string
    extractor: Extractor
}

export type ModelNestedValue = {
    query: string
    model: Model
    isGroup?: boolean
}

export type Model = {
    [key: string]: ModelValue | ModelNestedValue
}

class Page {
    private source: string

    public constructor(source: string) {
        this.source = source
    }

    private processModel(element: HTMLElement, model: Model): Item {
        const data: Item = {}

        for (const key in model) {
            const modelValue = model[key]

            if ("query" in modelValue && "extractor" in modelValue) {
                const { query, extractor } = modelValue as ModelValue

                if (query) {
                    const nestedElement = element.querySelector(query)

                    if (nestedElement) {
                        data[key] = extractor(nestedElement)
                    } else {
                        data[key] = ""
                    }
                } else {
                    data[key] = extractor(element)
                }
            } else {
                const { model: nestedModel, query, isGroup } = modelValue as ModelNestedValue
                const nestedElements = element.querySelectorAll(query)

                if (isGroup) {
                    data[key] = nestedElements.map(nestedElement => this.processModel(nestedElement, nestedModel))
                } else {
                    const nestedElement = nestedElements[0]
                    data[key] = nestedElement ? this.processModel(nestedElement, nestedModel) : {}
                }
            }
        }

        return data
    }

    public parseItemGroup(
        query: string,
        model: Model,
        limit?: number
    ): Item[] {
        const document = htmlParser.parse(this.source)
        const items = document.querySelectorAll(query)

        let dataSet = items.map((item, index) => {
            if (limit != undefined && index >= limit) return
            const data: Item = this.processModel(item, model)
            return data
        }) as Item[]

        if (limit != undefined && dataSet.length >= limit) {
            dataSet = dataSet.slice(0, limit)
        }

        return dataSet
    }

    public parseAll(
        query: string,
        extractor: Extractor,
        limit?: number
    ): string[] {
        const document = htmlParser.parse(this.source)
        const elements = document.querySelectorAll(query)

        let dataSet: string[] = []

        for (const element of elements) {
            if (limit != undefined && dataSet.length >= limit) break
            const data = extractor(element)
            dataSet.push(data)
        }

        return dataSet
    }

    public parseOne(query: string, extractor: Extractor): string {
        const data = this.parseAll(query, extractor, 1)[0]
        return data
    }
}

export default Page