import HtmlParser, { Extractor, HtmlParsingModel, ResultData } from "./parsing/html-parser.parsing"
import { Client } from "./clients/base.client"
import { AxiosClient } from "./clients"

export type Tracker = {
    query: string
    extractor: Extractor
}

export type XcrapOptions<T> = {
    client: T
}

export type ScrapeOptions<HtmlParsingModelType> = {
    url: string
    query: string
    model: HtmlParsingModelType
}

export type ScrapeAllOptions<HtmlParsingModelType> = {
    urls: string[]
    query: string
    model: HtmlParsingModelType
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
            const currentPage = Number(await page.parseOne(currentPageTracker))
            const lastPage = Number(await page.parseOne(lastPageTracker))

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

    public async scrape<HtmlParsingModelType extends HtmlParsingModel>({
        url,
        query,
        model
    }: ScrapeOptions<HtmlParsingModelType>): Promise<ResultData<HtmlParsingModelType>[]> {
        const page = await this.client.get(url)

        const items = page.parseItemGroup({
            query: query,
            model: model
        })

        return items
    }

    public async scrapeAll<HtmlParsingModelType extends HtmlParsingModel>({
        urls,
        query,
        model
    }: ScrapeAllOptions<HtmlParsingModelType>): Promise<ResultData<HtmlParsingModelType>[][]> {
        const htmlParsers = await this.client.getMany(urls)

        const itemsSet = await Promise.all(
            htmlParsers.map(async (htmlParser: HtmlParser) => {
                return await htmlParser.parseItemGroup({
                    query: query,
                    model: model
                })
            })
        )

        return itemsSet
    }
}

export default Xcrap