import { Options as NodeHtmlParserOptions } from "node-html-parser"

import { PageParserSet, PageParser } from "../parsing"

export type CorsProxyUrlFuction = () => string
export type ProxyFunction<ProxyReturn = any> = () => ProxyReturn
export type UserAgentFunction = () => string

export type ClientOptions<Proxy> = {
    corsProxyUrl?: string | CorsProxyUrlFuction
    proxy?: Proxy | ProxyFunction<Proxy>
    userAgent?: string | UserAgentFunction
    htmlParserOptions?: Partial<NodeHtmlParserOptions>
}

export const defaultUserAgent = "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"

class BaseClient<Proxy> {
    public readonly proxy?: Proxy | ProxyFunction<Proxy>
    public readonly userAgent?: string | UserAgentFunction
    public readonly corsProxyUrl?: string | CorsProxyUrlFuction
    public readonly htmlParserOptions?: Partial<NodeHtmlParserOptions>

    public constructor({
        proxy,
        userAgent,
        corsProxyUrl,
        htmlParserOptions
    }: ClientOptions<Proxy>) {
        this.proxy = proxy
        this.userAgent = userAgent ?? defaultUserAgent
        this.corsProxyUrl = corsProxyUrl
        this.htmlParserOptions = htmlParserOptions
    }

    protected get currentCorsProxyUrl(): string | undefined {
        const currentCorsProxyUrl = typeof this.corsProxyUrl === "function" ?
            this.corsProxyUrl() :
            this.corsProxyUrl

        return currentCorsProxyUrl
    }

    protected get currentUserAgent(): string | undefined {
        const currentUserAgent = typeof this.userAgent === "function" ?
            this.userAgent() :
            this.userAgent

        return currentUserAgent
    }

    protected get currentProxy(): any | undefined {
        const currentProxy = typeof this.proxy === "function" ?
            (this.proxy as ProxyFunction)() :
            this.proxy

        return currentProxy
    }
}

export type Client = {
    proxy?: any | ProxyFunction<any>
    userAgent?: string | UserAgentFunction
    corsProxyUrl?: string | CorsProxyUrlFuction
    get(url: string): Promise<PageParser>
    getAll(urls: string[]): Promise<PageParserSet>
}

export default BaseClient