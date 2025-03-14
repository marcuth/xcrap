import HtmlParser, { Extractor, HtmlParsingModel, HtmlParserResultData } from "./parsing/html-parser.parsing"
import HtmlParserList from "./parsing/html-parser-list.parsing"
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

export type ScrapeManyOptions<HtmlParsingModelType> = {
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

    protected ensureHtmlParser() {
        if (this.client.parserType !== "html") {
            throw new Error("The client parser must be an HTML parser!")
        }
    }

    protected ensurePageIndexGap(url: string) {
        if (!url.includes("{pageIndex}")) {
            throw new Error(`The provided URL '${url}' does not contain the {pageIndex} gap!`)
        }
    }

    public getPaginationUrlsWithRange({
        initUrl,
        paginationRange
    }: GetPaginationUrlsWithRangeOptions): string[] {
        const formattedUrls: string[] = []

        this.ensurePageIndexGap(initUrl)

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

        this.ensureHtmlParser()
        this.ensurePageIndexGap(initUrl)

        const parser = await this.client.get(initUrl) as HtmlParser
        const currentPage = Number(await parser.parseFirst(currentPageTracker))
        const lastPage = Number(await parser.parseFirst(lastPageTracker))

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
        this.ensureHtmlParser()

        const parser = await this.client.get<HtmlParser>(url)

        const items = await parser.parseItemGroup({
            query: query,
            model: model
        })

        return items
    }

    public async scrapeMany<HtmlParsingModelType extends HtmlParsingModel>({
        urls,
        query,
        model
    }: ScrapeManyOptions<HtmlParsingModelType>): Promise<HtmlParserResultData<HtmlParsingModelType>[][]> {
        this.ensureHtmlParser()

        const htmlParsers = await this.client.getMany<HtmlParserList>(urls)

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