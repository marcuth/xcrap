import htmlParser, { HTMLElement } from "node-html-parser"

export type Item = {
    [key: string]: string
}

export type Extractor = (element: HTMLElement) => string

export type Model = {
    [key: string]: {
        query?: string
        extractor: Extractor
    }
}

class Page {
    private source: string

    public constructor(source: string) {
        this.source = source
    }

    public parseItemGroup(
        query: string,
        model: Model,
        limit?: number
    ): Item[] {
        const document = htmlParser.parse(this.source)
        const items = document.querySelectorAll(query)

        let dataSet = items.map(item => {
            const data: Item = {}

            for (const key in model) {
                const { query, extractor } = model[key]

                if (query) {
                    const element = item.querySelector(query)

                    if (element) {
                        data[key] = extractor(element)
                    } else {
                        data[key] = ""
                    }
                } else {
                    data[key] = extractor(item)
                }
            }

            return data
        })

        if (limit != undefined && dataSet.length >= limit) {
            dataSet = dataSet.slice(0,  limit)
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