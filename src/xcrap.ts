import HtmlParser, { Extractor, HtmlParsingModel, HtmlParserResultData } from "@parsing/html-parser.parsing"
import HtmlParserList from "@parsing/html-parser-list.parsing"
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
    initUrl: string
    currentPageTracker: Tracker
    lastPageTracker: Tracker
    limit?: number
}

export type GetPaginationUrlsWithRangeOptions = {
    initUrl: string
    paginationRange: [number, number]
}

class Xcrap<T extends Client> {
    public readonly client: T

    public constructor({ client }: XcrapOptions<T>) {
        this.client = client
    }

    public static createDefault(): Xcrap<AxiosClient> {
        const client = new AxiosClient({ parserType: "html" })
        return new Xcrap<AxiosClient>({ client: client })
    }

    public getPaginationUrlsWithRange({
        initUrl,
        paginationRange
    }: GetPaginationUrlsWithRangeOptions): string[] {
        const formattedUrls: string[] = []

        if (!initUrl.includes("{pageIndex}")) {
            throw new Error(`The provided URL '${initUrl}' does not contain the {pageIndex} gap!`)
        }

        for (let pageIndex = paginationRange[0]; pageIndex <= paginationRange[1]; pageIndex++) {
            formattedUrls.push(initUrl.replace(/{pageIndex}/g, String(pageIndex)))
        }

        return formattedUrls
    }

    public async getPaginationUrlsWithTracker({
        initUrl,
        currentPageTracker,
        lastPageTracker,
        limit
    }: GetPaginationUrlsWithTrackerOptions): Promise<string[]> {
        const formattedUrls: string[] = []

        const parser = await this.client.get(initUrl) as HtmlParser
        const currentPage = Number(await parser.parseOne(currentPageTracker))
        const lastPage = Number(await parser.parseOne(lastPageTracker))

        if (!initUrl.includes("{pageIndex}")) {
            throw new Error(`The provided URL '${initUrl}' does not contain the {pageIndex} gap!`)
        }

        for (let pageIndex = currentPage; pageIndex <= lastPage; pageIndex++) {
            if (
                limit !== undefined &&
                limit !== null &&
                formattedUrls.length >= limit
            ) break

            const formattedUrl = initUrl.replace(/{pageIndex}/g, String(pageIndex))
            formattedUrls.push(formattedUrl)
        }

        return formattedUrls
    }

    public async scrape<HtmlParsingModelType extends HtmlParsingModel>({
        url,
        query,
        model
    }: ScrapeOptions<HtmlParsingModelType>): Promise<HtmlParserResultData<HtmlParsingModelType>[]> {
        const page = await this.client.get(url) as HtmlParser

        const items = page.parseItemGroup({
            query: query,
            model: model
        })

        return items
    }

    public async scrapeMany<HtmlParsingModelType extends HtmlParsingModel>({
        urls,
        query,
        model
    }: ScrapeAllOptions<HtmlParsingModelType>): Promise<HtmlParserResultData<HtmlParsingModelType>[][]> {
        const htmlParsers = await this.client.getMany(urls) as HtmlParserList

        const itemsList = await Promise.all(
            htmlParsers.map(async (htmlParser) => {
                return await htmlParser.parseItemGroup({
                    query: query,
                    model: model
                })
            })
        )

        return itemsList
    }
}

export default Xcrap