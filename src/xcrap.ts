import axios, { AxiosProxyConfig, Axios } from "axios"
import fakeUserAgent from "fake-useragent"

import Page, { Extractor } from "./page"
import PageSet from "./page-set"

export type Tracker = {
    query: string
    extractor: Extractor
}

export type ProxyFunction = () => AxiosProxyConfig
export type UserAgentFunction = () => string

export type XcrapOptions = {
    proxy?: AxiosProxyConfig | ProxyFunction,
    userAgent?: string | UserAgentFunction
}

const defaultUserAgent = "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"

class Xcrap {
    private client: Axios

    public constructor({
        proxy,
        userAgent = fakeUserAgent()
    }: XcrapOptions = {}) {
        const currentProxy = typeof proxy === "function" ?
            proxy() :
            proxy

        const currentUserAgent = typeof userAgent === "function" ?
            userAgent() :
            userAgent ??
            defaultUserAgent

        this.client = axios.create({
            proxy: currentProxy,
            headers: {
                "User-Agent": currentUserAgent
            }
        })

        this.client.interceptors.request.use((config) => {
            const currentProxy = typeof proxy === "function" ?
                proxy() :
                proxy

            const currentUserAgent = typeof userAgent === "function" ?
                userAgent() :
                userAgent ??
                defaultUserAgent
            
            config.proxy = currentProxy
            config.headers["User-Agent"] = currentUserAgent

            return config
        })
    }

    public async fetchPageSource(url: string): Promise<string> {
        const response = await this.client.get(url)
        return response.data as string
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

        return formattedUrls
    }

    public async get(url: string): Promise<Page> {
        const source = await this.fetchPageSource(url)
        const page = new Page(source)
        return page
    }

    public async getAll(urls: string[]): Promise<PageSet> {
        const tasks = []

        for (const url of urls) {
            tasks.push(this.get(url))
        }

        const pages = await Promise.all(tasks)
        const pageSet = new PageSet(...pages)

        return pageSet
    }
}

export default Xcrap