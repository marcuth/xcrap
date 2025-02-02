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

    public async fetchPageSource(url: string): Promise<string> {
        const response = await this.client.get(url)
        return response.data as string
    }

    public async get(url: string): Promise<PageParser> {
        const source = await this.fetchPageSource(`${this.currentCorsProxyUrl ?? ""}${url}`)
        const page = new PageParser(source)
        return page
    }

    public async getAll(urls: string[]): Promise<PageParserSet> {
        const tasks = urls.map((url) => this.get(url))
        const pages = await Promise.all(tasks)
        const pageSet = new PageParserSet(...pages)
        return pageSet
    }
}

export default AxiosClient