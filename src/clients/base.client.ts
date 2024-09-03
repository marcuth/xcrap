import PageSet from "../page-set"
import Page from "../page"

export type CorsProxyUrlFuction = () => string
export type ProxyFunction<ProxyReturn = any> = () => ProxyReturn
export type UserAgentFunction = () => string

export type ClientOptions<Proxy> = {
    corsProxyUrl?: string | CorsProxyUrlFuction
    proxy?: Proxy | ProxyFunction<Proxy>
    userAgent?: string | UserAgentFunction
}

export const defaultUserAgent = "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"

class BaseClient<Proxy> {
    public proxy?: Proxy | ProxyFunction<Proxy>
    public userAgent?: string | UserAgentFunction
    public corsProxyUrl?: string | CorsProxyUrlFuction

    public constructor({ proxy, userAgent, corsProxyUrl }: ClientOptions<Proxy>) {
        this.proxy = proxy
        this.userAgent = userAgent ?? defaultUserAgent
        this.corsProxyUrl = corsProxyUrl
    }
}

export type Client = {
    proxy?: any | ProxyFunction<any>
    userAgent?: string | UserAgentFunction
    get(url: string): Promise<Page>
    getAll(urls: string[]): Promise<PageSet>
}

export default BaseClient