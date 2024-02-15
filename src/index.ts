import axios, { AxiosProxyConfig, Axios } from "axios"

import Page, { Extractor } from "./page"
import PageSet from "./page-set"

export type Tracker = {
    query: string
    extractor: Extractor
}

export type XcrapOptions = {
    proxy?: AxiosProxyConfig,
    userAgent?: string
}

const defaultUserAgent = "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"

class Xcrap {
    private proxy?: AxiosProxyConfig
    private client: Axios
    private urls: string[]

    public constructor({ proxy, userAgent }: XcrapOptions = {}) {
        this.proxy = proxy
        this.urls = []

        this.client = axios.create({
            proxy: this.proxy,
            headers: {
                "User-Agent": userAgent ?? defaultUserAgent
            }
        })
    }

    public async fetchPageSource(url: string): Promise<string> {
        const response = await this.client.get(url)
        return response.data as string
    }

    public initUrls(urls: string[]): void {
        this.urls = urls
    }

    public initUrlsAndPaginateWithRange(initUrls: string[], paginationRange: [number, number]): void {
        const formattedUrls: string[] = []

        for (let pageIndex = paginationRange[0]; pageIndex <=  paginationRange[1]; pageIndex++) {
            for (let url in initUrls) {
                formattedUrls.push(url.replace(/{pageIndex}/g, String(pageIndex)))
            }
        }

        this.initUrls(formattedUrls)
    }

    public async initUrlsAndPaginateWithTracker(
        initUrls: string[],
        currentPageTracker: Tracker,
        lastPageTracker: Tracker,
        limits?: number[]
    ): Promise<void> {
        const formattedUrls: string[] = []

        for (let urlIndex = 0; urlIndex < initUrls.length; urlIndex++) {
            const currentFormattedUrls: string[] = []

            const url = initUrls[urlIndex]
            const page = await this.get(url)
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

        this.initUrls(formattedUrls)
    }

    public async get(url: string): Promise<Page> {
        const source = await this.fetchPageSource(url)
        const page = new Page(source)
        return page
    }

    public async getAll(): Promise<PageSet> {
        const tasks = []

        for (const url of this.urls) {
            tasks.push(this.fetchPageSource(url))
        }

        const sources = await Promise.all(tasks)
        const pages = sources.map(source => new Page(source))
        const pageSet = new PageSet(...pages)

        return pageSet
    }
}

export default Xcrap