import axios, { Axios, AxiosInstance, AxiosInterceptorManager, AxiosProxyConfig, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { RateLimitedAxiosInstance, rateLimitOptions } from "axios-rate-limit"
const axiosRateLimit = require("axios-rate-limit")

import { HtmlParserList, HtmlParser, SingleParserType, MultipleParserType, SingleParser } from "@parsing/index"
import BaseClient, { Client, ClientOptions, defaultUserAgent } from "@clients/base.client"
import JsonParserList from "@parsing/json-parser-list.parsing"

export type AxiosClientOptions = ClientOptions<AxiosProxyConfig> & {
    withCredentials?: boolean
    rateLimit?: rateLimitOptions
}

export type AxiosInterceptors = {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
}

export type FetchPageOptions = AxiosRequestConfig & {
    url: string
}

export type GetMethodOptions = FetchPageOptions

export type GetManyMethodOptions = {
    suboptions: GetMethodOptions[]
    concurrency?: number
}

class AxiosClient extends BaseClient<AxiosProxyConfig> implements Client {
    protected axiosInstance: Axios
    protected client: RateLimitedAxiosInstance
    public interceptors: AxiosInterceptors  

    public constructor(options: AxiosClientOptions = {}) {
        super(options)

        this.axiosInstance = axios.create({
            proxy: this.currentProxy,
            headers: {
                "User-Agent": this.currentUserAgent ?? defaultUserAgent
            },
            ...(options.withCredentials && { withCredentials: options.withCredentials })
        })

        this.client = axiosRateLimit(
            this.axiosInstance as AxiosInstance,
            options.rateLimit ?? {}
        )

        this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            config.proxy = this.currentProxy

            if (config.headers) {
                config.headers["User-Agent"] = this.currentUserAgent ?? defaultUserAgent
            } else {
                (config as AxiosRequestConfig).headers = { "User-Agent": this.currentUserAgent }
            }

            return config
        })

        this.interceptors = this.client.interceptors
    }

    public async fetchPageData(urlOrOptions: FetchPageOptions): Promise<string> {
        const url = typeof urlOrOptions === "string" ? urlOrOptions : urlOrOptions.url
        const { url: _, ...options } = typeof urlOrOptions === "string" ? { url: undefined } : urlOrOptions
        const response = await this.client.get(`${this.currentProxyUrl ?? ""}${url}`, options)
        return response.data as string
    }

    public async get(options: GetMethodOptions) {
        const source = await this.fetchPageData(options)
        const page = this.createSingleParser(this.parserType, source)
        return page
    }
    
    public async getMany({ suboptions, concurrency }: GetManyMethodOptions) {
        const tasks = suboptions.map((suboption) => (
            async () => await this.get(suboption)
        ))

        const parsers: SingleParser<any>[] = []
        const tasksChunks = this.createTaskChunks<any>(tasks, concurrency ?? suboptions.length)

        for (const taskChunk of tasksChunks) {
            const chunkPages = await Promise.all(taskChunk.map(task => task()))
            parsers.push(...chunkPages)
        }

        const pageSet = this.createMultipleParser(this.parserType, parsers)

        return pageSet
    }
}

const client = new AxiosClient({
    parserType: "html",
    
})

export default AxiosClient