import { Options as NodeHtmlParserOptions } from "node-html-parser"

import { SingleParser, MultipleParser, HtmlParser, HtmlParserList, JsonParser } from "@parsing/index"
import JsonParserList from "@parsing/json-parser-list.parsing"

export type ProxyUrlFuction = () => string
export type ProxyFunction<ProxyReturn = any> = () => ProxyReturn
export type UserAgentFunction = () => string

export enum ParserType {
    Json = "json",
    Html = "html"
}

export type ClientOptions<Proxy> = {
    proxyUrl?: string | ProxyUrlFuction
    proxy?: Proxy | ProxyFunction<Proxy>
    userAgent?: string | UserAgentFunction
    nodeHtmlParserOptions?: Partial<NodeHtmlParserOptions>
    parserType?: `${ParserType}`
}


export const defaultUserAgent = "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"

class BaseClient<Proxy> {
    public readonly proxy?: Proxy | ProxyFunction<Proxy>
    public readonly userAgent?: string | UserAgentFunction
    public readonly proxyUrl?: string | ProxyUrlFuction
    public readonly nodeHtmlParserOptions?: Partial<NodeHtmlParserOptions>
    protected readonly parserType: `${ParserType}`

    public constructor({
        proxy,
        userAgent,
        proxyUrl,
        nodeHtmlParserOptions,
        parserType
    }: ClientOptions<Proxy>) {
        this.proxy = proxy
        this.userAgent = userAgent ?? defaultUserAgent
        this.proxyUrl = proxyUrl
        this.nodeHtmlParserOptions = nodeHtmlParserOptions
        this.parserType = parserType ?? "html"
    }

    public createSingleParser<T extends keyof typeof parsers>(type: T, data: string): InstanceType<typeof parsers[T]> {
        const parsers = {
            html: HtmlParser,
            json: JsonParser
        } as const
    
        const ParserClass = parsers[type];
    
        if (!ParserClass) {
            throw new Error(`Unsupported data parser type: ${type}`)
        }
    
        return new ParserClass(data) as InstanceType<typeof parsers[T]>
    }

    public createMultipleParser<T extends keyof typeof parsers>(type: T, singleParsers: SingleParser<any>[]): MultipleParser<any> {
        const parsers = {
            html: HtmlParserList,
            json: JsonParserList
        } as const
    
        const ParserClass = parsers[type]
    
        if (!ParserClass) {
            throw new Error(`Unsupported data parser type: ${type}`)
        }

        const TypedParserClass = ParserClass as unknown as { new (parsers: SingleParser<any>[]): MultipleParser<any> }
    
        return new TypedParserClass(singleParsers)
    }

    protected get currentProxyUrl(): string | undefined {
        const currentProxyUrl = typeof this.proxyUrl === "function" ?
            this.proxyUrl() :
            this.proxyUrl

        return currentProxyUrl
    }

    protected get currentUserAgent(): string | undefined {
        const currentUserAgent = typeof this.userAgent === "function" ?
            this.userAgent() :
            this.userAgent

        return currentUserAgent
    }

    protected createTaskChunks<T extends any>(tasks: (() => Promise<SingleParser<T>>)[], concurrency: number): (() => Promise<SingleParser<T>>)[][] {
        const taskChunks: (() => Promise<SingleParser<T>>)[][] = []
        const tasksLength = tasks.length

        for (let i = 0; i < tasksLength; i += concurrency) {
            taskChunks.push(tasks.slice(i, i + concurrency))
        }

        return taskChunks
    }

    protected get currentProxy(): any | undefined {
        const currentProxy = typeof this.proxy === "function" ?
            (this.proxy as ProxyFunction)() :
            this.proxy

        return currentProxy
    }
}

new BaseClient({

})

export type Client = {
    proxy?: any | ProxyFunction<any>
    userAgent?: string | UserAgentFunction
    proxyUrl?: string | ProxyUrlFuction
    get(...args: any[]): Promise<SingleParser<any>>
    getMany(...args: any[]): Promise<MultipleParser<any>>
}

export default BaseClient