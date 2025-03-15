import { extractHref, extractInnerText, HtmlParser, HtmlParsingModel } from "../src/parsing"
import { TransformationModel, transformData } from "../src/transforming"
import { Xcrap } from "../src"
import { AxiosClient } from "../src/clients"

;(async () => {
    // const htmlParsingModel = {
    //     title: {
    //         query: "title",
    //         extractor: extractInnerText,
    //     },
    // } satisfies HtmlParsingModel

    // const result = await xcrap.scrape({
    //     url: "https://google.com",
    //     model: htmlParsingModel,
    //     query: "head",
    // })

    // const transformationModel = {
    //     title: [({ title }) => {
    //         return title.toUpperCase()
    //     }]
    // } satisfies TransformationModel<typeof result[0]>

    // const transformedResult = transformData({
    //     data: result[0],
    //     model: transformationModel,
    // })

    // console.log(transformedResult)
    const xcrap = new Xcrap({
        client: new AxiosClient({
            withCredentials: true,
            rateLimit: {
                maxRequests: 1,
                perMilliseconds: 1000
            },
            parserType: "html"
        })
    })

    const parser = await xcrap.client.get<HtmlParser>({
        url: "https://pythonscraping.com/pages/auth/login.php",
        auth: {
            username: "batat",
            password: "dasdasdasd",
        },
    })

    const url = await parser.parseFirst({
        query: "a",
        extractor: extractHref,
    })

    console.log(parser.source)
})();