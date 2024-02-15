import Page, { Item, Model, Extractor } from "./page"

class PageSet extends Array<Page> {
    public parseItemGroupForAll(
        query: string,
        model: Model,
        limit?: number
    ): Item[] {
        const dataSet: Item[] = []

        for (const page of this) {
            const adjustedLimit = limit !== undefined && limit !== null ? limit - this.length : limit
            const currentDataSet = page.parseItemGroup(query, model, adjustedLimit)
            dataSet.push(...currentDataSet)
        }

        return dataSet
    }

    public parseAll(query: string, extractor: Extractor, limit?: number): string[] {
        const dataSet: string[] = []

        for (const page of this) {
            if (limit !== undefined && limit !== null && this.length >= limit) break

            const adjustedLimit = limit !== undefined && limit !== null ? limit - this.length : limit
            const currentDataSet = page.parseAll(query, extractor, adjustedLimit)
            dataSet.push(...currentDataSet)
        }

        return dataSet
    }
}

export default PageSet