import PageParser, { Extractor, ParsingModel, ResultData } from "./parsing/page-parser.parsing"
import { Client } from "./clients/base.client"
import { AxiosClient } from "./clients"

export type Tracker = {
    query: string
    extractor: Extractor
}

export type XcrapOptions<T> = {
    client: T
}

export type ScrapeOptions<ParsingModelType> = {
    url: string
    query: string
    model: ParsingModelType
}

export type ScrapeAllOptions<ParsingModelType> = {
    urls: string[]
    query: string
    model: ParsingModelType
}

export type GetPaginationUrlsWithTrackerOptions = {
    initUrls: string[]
    currentPageTracker: Tracker
    lastPageTracker: Tracker
    limits?: number[]
}

export type GetPaginationUrlsWithRangeOptions = {
    initUrls: string[]
    paginationRange: [number, number]
}

class Xcrap<T extends Client> {
    public readonly client: T

    public constructor({ client }: XcrapOptions<T>) {
        this.client = client
    }

    public static createDefault(): Xcrap<AxiosClient> {
        const client = new AxiosClient()
        return new Xcrap<AxiosClient>({ client: client })
    }

    public getPaginationUrlsWithRange({
        initUrls,
        paginationRange
    }: GetPaginationUrlsWithRangeOptions): string[] {
        const formattedUrls: string[] = []

        for (let pageIndex = paginationRange[0]; pageIndex <= paginationRange[1]; pageIndex++) {
            for (let url of initUrls) {
                formattedUrls.push(url.replace(/{pageIndex}/g, String(pageIndex)))
            }
        }

        return formattedUrls
    }

    public async getPaginationUrlsWithTracker({
        initUrls,
        currentPageTracker,
        lastPageTracker,
        limits
    }: GetPaginationUrlsWithTrackerOptions): Promise<string[]> {
        const formattedUrls: string[] = []

        for (let urlIndex = 0; urlIndex < initUrls.length; urlIndex++) {
            const currentFormattedUrls: string[] = []

            const url = initUrls[urlIndex]
            const page = await this.client.get(url)
            const currentPage = Number(page.parseOne(currentPageTracker))
            const lastPage = Number(page.parseOne(lastPageTracker))

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

    public async scrape<ParsingModelType extends ParsingModel>({
        url,
        query,
        model
    }: ScrapeOptions<ParsingModelType>): Promise<ResultData<ParsingModelType>[]> {
        const page = await this.client.get(url)

        const items = page.parseItemGroup({
            query: query,
            model: model
        })

        return items
    }

    public async scrapeAll<ParsingModelType extends ParsingModel>({
        urls,
        query,
        model
    }: ScrapeAllOptions<ParsingModelType>): Promise<ResultData<ParsingModelType>[][]> {
        const pageParsers = await this.client.getAll(urls)

        const itemsSet = await Promise.all(
            pageParsers.map(async (pageParser: PageParser) => {
                return await pageParser.parseItemGroup({
                    query: query,
                    model: model
                })
            })
        )

        return itemsSet
    }
}

export default Xcrap