import axios, { Axios, AxiosInstance, AxiosInterceptorManager, AxiosProxyConfig, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { RateLimitedAxiosInstance, rateLimitOptions } from "axios-rate-limit"
const axiosRateLimit = require("axios-rate-limit")

import BaseClient, { Client, ClientOptions, defaultUserAgent } from "../clients/base.client"
import {  SingleParser } from "../parsing/index"

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
    requests: GetMethodOptions[]
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

    public async get<T>(options: GetMethodOptions): Promise<T>  {
        const source = await this.fetchPageData(options)
        const parser = this.createSingleParser(this.parserType, source) as T
        return parser
    }
    
    public async getMany<T>({ requests, concurrency }: GetManyMethodOptions): Promise<T> {
        const tasks = requests.map((request) => (
            async () => await this.get<T>(request)
        ))

        const parsers: SingleParser<T>[] = [] 
        const tasksChunks = this.createTaskChunks<any>(tasks, concurrency ?? requests.length)

        for (const taskChunk of tasksChunks) {
            const chunkPages = await Promise.all(taskChunk.map(task => task()))
            parsers.push(...chunkPages)
        }

        const parserList = this.createMultipleParser(this.parserType, parsers)

        return parserList as T
    }
}

const client = new AxiosClient({
    parserType: "html",
    
})

export default AxiosClient