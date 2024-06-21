import axios, { Axios, AxiosProxyConfig, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

import BaseClient, { Client, ClientOptions, defaultUserAgent } from "./base.client"
import PageSet from "../page-set"
import Page from "../page"

class AxiosClient extends BaseClient<AxiosProxyConfig> implements Client {
    private client: Axios

    constructor(options: ClientOptions<AxiosProxyConfig> = {}) {
        super(options)

        const currentProxy = typeof this.proxy === "function" ?
            this.proxy() :
            this.proxy

        const currentUserAgent = typeof this.userAgent === "function" ?
            this.userAgent() :
            this.userAgent ??
            defaultUserAgent

        this.client = axios.create({
            proxy: currentProxy,
            headers: {
                "User-Agent": currentUserAgent
            }
        })

        this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            return this.interceptRequest.bind(this)(config)
        })
    }

    private interceptRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        const currentProxy = typeof this.proxy === "function" ?
            this.proxy() :
            this.proxy

        const currentUserAgent = typeof this.userAgent === "function" ?
            this.userAgent() :
            this.userAgent ??
            defaultUserAgent
        
        config.proxy = currentProxy

        if (config.headers) {
            config.headers["User-Agent"] = currentUserAgent
        } else {
            (config as AxiosRequestConfig).headers = { "User-Agent": currentUserAgent }
        }

        return config
    }

    public async fetchPageSource(url: string): Promise<string> {
        const response = await this.client.get(url)
        return response.data as string
    }

    public async get(url: string): Promise<Page> {
        const source = await this.fetchPageSource(url)
        const page = new Page(source)
        return page
    }

    public async getAll(urls: string[]): Promise<PageSet> {
        const tasks = urls.map((url) => this.get(url))
        const pages = await Promise.all(tasks)
        const pageSet = new PageSet(...pages)
        return pageSet
    }
}

export default AxiosClient