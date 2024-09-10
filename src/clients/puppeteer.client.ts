import puppeteer, { Browser, Page as PuppeteerPage, PuppeteerLaunchOptions } from "puppeteer"

import BaseClient, { Client, ClientOptions } from "./base.client"
import { PageParserSet, PageParser } from "../parsing"

export type PuppeteerProxy = string
export type PuppeteerClientOptions = ClientOptions<PuppeteerProxy> & PuppeteerLaunchOptions & {}
export type PuppeteerClientActionFunction = (page: PuppeteerPage) => any | Promise<any>
export type PuppeteerClientActionType = "beforeRequest" | "afterRequest"

export type PuppeteerClientAction = PuppeteerClientActionFunction | {
    func: PuppeteerClientActionFunction
    type: PuppeteerClientActionType
}

export type GetMethodOptions = {
    url: string
    actions?: PuppeteerClientAction[]
    javaScriptEnabled?: boolean
}

export type GetAllMethodOptions = GetMethodOptions[]

export type ExtractActionsResult = {
    before: PuppeteerClientActionFunction[]
    after: PuppeteerClientActionFunction[]
}

export const defaultActionType = "afterRequest"

class PuppeteerClient extends BaseClient<PuppeteerProxy> implements Client {
    public readonly options: PuppeteerClientOptions
    protected browser?: Browser

    public constructor(options: PuppeteerClientOptions = {}) {
        super(options)

        this.options = options
        this.browser = undefined
    }
    
    protected async initBrowser(): Promise<void> {
        const puppeteerArguments: string[] = []

        if (this.proxy) {
            puppeteerArguments.push(`--proxy-server=${this.currentProxy}`)
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

    protected async ensureBrowser(): Promise<void> {
        if (!this.browser) {
            await this.initBrowser()
        }
    }

    protected async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close()
            this.browser = undefined
        }
    }

    protected async configurePage(page: PuppeteerPage, options?: GetMethodOptions): Promise<void> {
        if (this.currentUserAgent) {
            await page.setUserAgent(this.currentUserAgent)
        }

        if (options?.javaScriptEnabled !== undefined) {
            await page.setJavaScriptEnabled(options.javaScriptEnabled)
        }
    }

    protected extractActions(actions: PuppeteerClientAction[] | undefined): ExtractActionsResult {
        const actionsBeforeRequest: PuppeteerClientActionFunction[] = []
        const actionsAfterRequest: PuppeteerClientActionFunction[] = []

        if (!actions) {
            actions = []
        }

        for (const action of actions) {
            const actionType = typeof action === "function" ? defaultActionType : action.type
            const actionFunc = typeof action === "function" ? action : action.func

            if (actionType === "beforeRequest") {
                actionsBeforeRequest.push(actionFunc)
            } else {
                actionsAfterRequest.push(actionFunc)
            }
        }

        return {
            before: actionsBeforeRequest,
            after: actionsAfterRequest
        }
    }

    protected async executeActions(page: PuppeteerPage, actions: PuppeteerClientActionFunction[]): Promise<void> {
        for (const action of actions) {
            await action(page)
        }
    }

    public async get(urlOrOptions: string | GetMethodOptions): Promise<PageParser> {
        await this.ensureBrowser()

        let url = typeof urlOrOptions === "string" ? urlOrOptions : urlOrOptions.url

        const {
            before: actionsBeforeRequest,
            after: actionsAfterRequest
        } = this.extractActions(typeof urlOrOptions === "string" ? undefined : urlOrOptions.actions)

        const page = await this.browser!.newPage()

        await this.configurePage(page, typeof urlOrOptions === "string" ? undefined : urlOrOptions)
        await this.executeActions(page, actionsBeforeRequest)
        await page.goto(`${this.currentCorsProxyUrl ?? ""}${url}`)
        await this.executeActions(page, actionsAfterRequest)
        const content = await page.content()
        await page.close()

        return new PageParser(content)
    }

    public async getAll(urlsOrOptions: string[] | GetAllMethodOptions): Promise<PageParserSet> {
        await this.ensureBrowser()

        const pageSet = new PageParserSet()

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