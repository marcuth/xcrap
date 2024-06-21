import { Extractor, Item, Model } from "./page"
import { Client } from "./clients/base.client"

export type Tracker = {
    query: string
    extractor: Extractor
}

export type XcrapOptions = {
    client: Client
}

export type ScrapeOptions = {
    url: string
    query: string
    model: Model
}

export type ScrapeAllOptions = {
    urls: string[]
    query: string
    model: Model
}

class Xcrap {
    private client: Client

    public constructor({ client }: XcrapOptions) {
        this.client = client
    }

    public getPaginationUrlsWithRange(initUrls: string[], paginationRange: [number, number]): string[] {
        const formattedUrls: string[] = []

        for (let pageIndex = paginationRange[0]; pageIndex <=  paginationRange[1]; pageIndex++) {
            for (let url in initUrls) {
                formattedUrls.push(url.replace(/{pageIndex}/g, String(pageIndex)))
            }
        }

        return formattedUrls
    }

    public async getPaginationUrlsWithTracker(
        initUrls: string[],
        currentPageTracker: Tracker,
        lastPageTracker: Tracker,
        limits?: number[]
    ): Promise<string[]> {
        const formattedUrls: string[] = []

        for (let urlIndex = 0; urlIndex < initUrls.length; urlIndex++) {
            const currentFormattedUrls: string[] = []

            const url = initUrls[urlIndex]
            const page = await this.client.get(url)
            const currentPage = Number(page.parseOne(currentPageTracker.query, currentPageTracker.extractor))
            const lastPage = Number(page.parseOne(lastPageTracker.query, lastPageTracker.extractor))

            for (let pageIndex = currentPage; pageIndex <= lastPage; pageIndex++) {
                if (
                    limits !== undefined &&
                    limits !== null &&
                    limits[urlIndex] !== null &&
                    currentFormattedUrls.length >= limits[urlIndex]
                ) break

                const formattedUrl = url.replace(/{pageIndex}/g, String(pageIndex))
                currentFormattedUrls.push(formattedUrl)
            }

            formattedUrls.push(...currentFormattedUrls)
        }

        return formattedUrls
    }

    public async scrape({ url, query, model }: ScrapeOptions): Promise<Item[]> {
        const page = await this.client.get(url)
        const items = page.parseItemGroup(query, model)
        return items
    }

    public async scrapeAll({ urls, query, model }: ScrapeAllOptions): Promise<Item[][]> {
        const pages = await this.client.getAll(urls)
        const itemsSet = pages.map(page => page.parseItemGroup(query, model))
        return itemsSet
    }
}

export default Xcrap