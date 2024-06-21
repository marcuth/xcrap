import puppeteer, { Browser, PuppeteerLaunchOptions } from "puppeteer"

import BaseClient, { Client, ClientOptions } from "./base.client"
import PageSet from "../page-set"
import Page from "../page"

export type PuppeteerProxy = string

export type PuppeteerClientOptions = Omit<
    ClientOptions<PuppeteerProxy> & PuppeteerLaunchOptions, "userAgent"
> 

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

        this.browser = await puppeteer.launch({
            ...this.options,
            args: puppeteerArguments ?? this.options.args
        })
    }

    private async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close()
            this.browser = undefined
        }
    }

    public async get(url: string): Promise<Page> {
        if (!this.browser) {
            await this.initBrowser()
        }

        const page = await this.browser!.newPage()
        await page.goto(url)
        const content = await page.content()
        await page.close()
        return new Page(content)
    }

    public async getAll(urls: string[]): Promise<PageSet> {
        if (!this.browser) {
            await this.initBrowser()
        }

        const pageSet = new PageSet()

        for (const url of urls) {
            const page = await this.get(url)
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