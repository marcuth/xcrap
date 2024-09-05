import puppeteer, { Browser, Page as PuppeteerPage, PuppeteerLaunchOptions } from "puppeteer"

import BaseClient, { Client, ClientOptions } from "./base.client"
import PageSet from "../page-set"
import Page from "../page"

export type PuppeteerProxy = string

export type PuppeteerClientOptions = ClientOptions<PuppeteerProxy> & PuppeteerLaunchOptions & {}

export type GetMethodOptionActionsPropItem = (page: PuppeteerPage) => any | Promise<any>

export type GetMethodOptions = {
    url: string
    actions?: GetMethodOptionActionsPropItem[]
    javaScriptEnabled?: boolean
}

export type GetAllMethodOptions = GetMethodOptions[]

class PuppeteerClient extends BaseClient<PuppeteerProxy> implements Client {
    public readonly options: PuppeteerClientOptions
    private browser?: Browser

    public constructor(options: PuppeteerClientOptions = {}) {
        super(options)

        this.options = options
        this.browser = undefined
    }

    private async initBrowser(): Promise<void> {
        const puppeteerArguments: string[] = []

        if (this.proxy) {
            const currentProxy = typeof this.proxy === "function" ?
                this.proxy() :
                this.proxy

            puppeteerArguments.push(`--proxy-server=${currentProxy}`)
        }

        if (this.options.args && this.options.args.length > 0) {
            puppeteerArguments.push(...this.options.args)
        }

        this.browser = await puppeteer.launch({
            ...this.options,
            args: puppeteerArguments,
            headless: this.options.headless ? "shell" : false
        })
    }

    private async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close()
            this.browser = undefined
        }
    }

    public async get(urlOrOptions: string | GetMethodOptions): Promise<Page> {
        let url = typeof urlOrOptions === "string" ? urlOrOptions : urlOrOptions.url

        if (!this.browser) {
            await this.initBrowser()
        }

        const currentCorsProxyUrl = typeof this.corsProxyUrl === "function" ?
            this.corsProxyUrl() :
            this.corsProxyUrl

        const currentUserAgent = typeof this.userAgent === "function" ?
            this.userAgent() :
            this.userAgent

        const page = await this.browser!.newPage()

        if (currentUserAgent) {
            page.setUserAgent(currentUserAgent)
        }

        if (typeof urlOrOptions !== "string" && urlOrOptions.javaScriptEnabled) {
            page.setJavaScriptEnabled(urlOrOptions.javaScriptEnabled ? true : false)
        }

        await page.goto(`${currentCorsProxyUrl ?? ""}${url}`)

        if (typeof urlOrOptions !== "string") {
            const actions = urlOrOptions.actions ?? []

            for (const action of actions) {
                await action(page)
            }
        }

        const content = await page.content()
        await page.close()

        return new Page(content)
    }

    public async getAll(urlsOrOptions: string[] | GetAllMethodOptions): Promise<PageSet> {
        if (!this.browser) {
            await this.initBrowser()
        }

        const pageSet = new PageSet()

        for (const urlOrOption of urlsOrOptions) {
            const page = await this.get(urlOrOption)
            pageSet.push(page)
        }

        return pageSet
    }

    public async close(): Promise<void> {
        if (this.browser) {
            await this.closeBrowser()
        }
    }
}

export default PuppeteerClient