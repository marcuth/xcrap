import axios, { Axios, AxiosInterceptorManager, AxiosProxyConfig, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"

import BaseClient, { Client, ClientOptions, defaultUserAgent } from "./base.client"
import { PageParserSet, PageParser } from "../parsing"

export type AxiosClientOptions = ClientOptions<AxiosProxyConfig> & {
    withCredentials?: boolean
}

export type AxiosInterceptors = {
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
}

export type FetchPageOptions = string | AxiosRequestConfig & {
    url: string
}

export type GetMethodOptions = FetchPageOptions

export type GetAllMethodOptions = {
    urlsOrSuboptions: GetMethodOptions[]
    concurrency?: number
}

class AxiosClient extends BaseClient<AxiosProxyConfig> implements Client {
    protected client: Axios
    public interceptors: AxiosInterceptors

    public constructor(options: AxiosClientOptions = {}) {
        super(options)

        this.client = axios.create({
            proxy: this.currentProxy,
            headers: {
                "User-Agent": this.currentUserAgent ?? defaultUserAgent
            },
            ...(options.withCredentials && { withCredentials: options.withCredentials })
        })

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

    public async fetchPageSource(urlOrOptions: FetchPageOptions): Promise<string> {
        const url = typeof urlOrOptions === "string" ? urlOrOptions : urlOrOptions.url
        const { url: _, ...options } = typeof urlOrOptions === "string" ? { url: undefined } : urlOrOptions
        const response = await this.client.get(`${this.currentCorsProxyUrl ?? ""}${url}`, options)
        return response.data as string
    }

    public async get(options: GetMethodOptions): Promise<PageParser> {
        const source = await this.fetchPageSource(options)
        const page = new PageParser(source)
        return page
    }

    private createTaskChunks(tasks: Promise<PageParser>[], concurrency: number): Promise<PageParser>[][] {
        const taskChunks: Promise<PageParser>[][] = []
        const tasksLength = tasks.length

        for (let i = 0; i < tasksLength; i += concurrency) {
            taskChunks.push(tasks.slice(i, i + concurrency))
        }

        return taskChunks
    }
    
    public async getAll({ urlsOrSuboptions, concurrency }: GetAllMethodOptions): Promise<PageParserSet> {
        const tasks = urlsOrSuboptions.map((getMethodOptions) => this.get(getMethodOptions))
        const pages: PageParser[] = []

        const tasksChunks = this.createTaskChunks(tasks, concurrency ?? urlsOrSuboptions.length)

        for (const taskChunk of tasksChunks) {
            const chunkPages = await Promise.all(taskChunk)
            pages.push(...chunkPages)
        }

        const pageSet = new PageParserSet(...pages)
        return pageSet
    }
}

export default AxiosClient