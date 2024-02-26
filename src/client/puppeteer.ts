import puppeteer, { Browser } from "puppeteer"

import BaseClient, { Client, ClientOptions } from "./base"
import PageSet from "../page-set"
import Page from "../page"

export type PuppeteerProxy = string

export type PuppeteerClientOptions = Omit<
    ClientOptions<PuppeteerProxy> & {
        headless?: boolean
    }, "userAgent"
>

class PuppeteerClient extends BaseClient<PuppeteerProxy> implements Client {
    public headless: boolean
    private browser?: Browser

    public constructor(options: PuppeteerClientOptions = {}) {
        super(options)

        this.headless = options.headless ? true : false
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
            headless: this.headless,
            args: puppeteerArguments
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