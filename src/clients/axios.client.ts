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

export type UrlOrOptions = string | AxiosRequestConfig & {
    url: string
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

    public async fetchPageSource(urlOrOptions: UrlOrOptions): Promise<string> {
        const url = typeof urlOrOptions === "string" ? urlOrOptions : urlOrOptions.url
        const { url: _, ...options } = typeof urlOrOptions === "string" ? { url: undefined } : urlOrOptions
        const response = await this.client.get(`${this.currentCorsProxyUrl ?? ""}${url}`, options)
        return response.data as string
    }

    public async get(urlOrOptions: UrlOrOptions): Promise<PageParser> {
        const source = await this.fetchPageSource(urlOrOptions)
        const page = new PageParser(source)
        return page
    }

    public async getAll(urlsOrOptions: UrlOrOptions[]): Promise<PageParserSet> {
        const tasks = urlsOrOptions.map((urlOrOptions) => this.get(urlOrOptions))
        const pages = await Promise.all(tasks)
        const pageSet = new PageParserSet(...pages)
        return pageSet
    }
}

export default AxiosClient