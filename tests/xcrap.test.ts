import { extractInnerText, PageParser } from "../src/parsing"
import { AxiosClient } from "../src/clients"
import Xcrap from "../src/xcrap"

jest.mock("../src/clients", () => {
    return {
        AxiosClient: jest.fn().mockImplementation(() => ({
            get: jest.fn(),
        })),
    }
})

describe("Create Xcrap Instance", () => {
    let xcrap: Xcrap<AxiosClient>
    let mockClient: jest.Mocked<AxiosClient>

    beforeEach(() => {
        mockClient = new AxiosClient() as jest.Mocked<AxiosClient>
        xcrap = new Xcrap({ client: mockClient })
    })

    it("Should scrape data from a URL", async () => {
        const mockHtml = `<html><body><div class="item">Xpto</div></body></html>`
        const mockPageParser = new PageParser(mockHtml)

        mockClient.get.mockResolvedValue(mockPageParser)

        const result = await xcrap.scrape({
            url: "https://example.com",
            query: "body",
            model: {
                item: {
                    query: ".item",
                    fieldType: "single",
                    extractor: extractInnerText
                }
            }
        })

        expect(mockClient.get).toHaveBeenCalledWith("https://example.com")
        expect(result).toEqual([{ item: "Xpto" }])
    })
})