import MockAdapter from "axios-mock-adapter"
import axios from "axios"

import { PageParser, PageParserSet } from "../src/parsing"
import { AxiosClient } from "../src/clients"

describe("Axios Client", () => {
    let axiosClient: AxiosClient
    let mockAxios: typeof MockAdapter.prototype

    beforeEach(() => {
        axiosClient = new AxiosClient()
        mockAxios = new MockAdapter(axios)
    })

    afterEach(() => {
        mockAxios.restore()
    })

    it("Should configure the with proxy and User-Agent", async () => {
        const proxyConfig = {
            host: "proxy.example.com",
            port: 8080
        }

        const userAgent = "Custom User-Agent"

        const client = new AxiosClient({
            proxy: proxyConfig,
            userAgent: userAgent
        })

        mockAxios.onGet("https://example.com").reply(200, "<html></html>")

        await client.fetchPageSource("https://example.com")

        const request = mockAxios.history.get[0]
        expect(request.proxy).toEqual(proxyConfig)
        expect(request.headers?.["User-Agent"]).toBe(userAgent)
    })

    it("Should fetch page source correctly", async () => {
        const mockHtml = "<html><body>Xpto</body></html>"

        mockAxios.onGet("https://example.com").reply(200, mockHtml)

        const result = await axiosClient.fetchPageSource("https://example.com")
        expect(result).toBe(mockHtml)
    })

    it("Should get a PageParser instance for a URL", async () => {
        const mockHtml = "<html><body>Xpto</body></html>"
        
        mockAxios.onGet("https://example.com").reply(200, mockHtml)

        const pageParser = await axiosClient.get("https://example.com")

        expect(pageParser).toBeInstanceOf(PageParser)
        expect(pageParser.source).toBe(mockHtml)
    })

    it("Should get a PageParserSet for multiple URLs", async () => {
        const mockHtml1 = "<html><body>Xpto 1</body></html>"
        const mockHtml2 = "<html><body>Xpto 2</body></html>"

        mockAxios.onGet("https://example.com/1").reply(200, mockHtml1)
        mockAxios.onGet("https://example.com/2").reply(200, mockHtml2)

        const pageParserSet = await axiosClient.getAll([
            "https://example.com/1",
            "https://example.com/2"
        ])

        expect(pageParserSet).toBeInstanceOf(PageParserSet)
        expect(pageParserSet.length).toBe(2)
        expect(pageParserSet[0].source).toBe(mockHtml1)
        expect(pageParserSet[1].source).toBe(mockHtml2)
    })
})