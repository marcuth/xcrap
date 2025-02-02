import { extractInnerText, ParsingModel } from "../src/parsing"
import { TransformationModel, transformData } from "../src/transforming"
import { Xcrap } from "../src"
import { AxiosClient } from "../src/clients"

;(async () => {
    // const parsingModel = {
    //     title: {
    //         query: "title",
    //         extractor: extractInnerText,
    //     },
    // } satisfies ParsingModel

    // const result = await xcrap.scrape({
    //     url: "https://google.com",
    //     model: parsingModel,
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
            withCredentials: true
        })
    })
})();