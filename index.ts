import fakeUa from "fake-useragent"
import fs from "fs"

import { trimString, stringToNumber } from "./src/data-transformer/transformers"

import Xcrap, { transformData, TransformationModel, callNext, PuppeteerClient, Model, extractText } from "./src"
import { ResultData } from "./src/page"

async function scrapeDeetlistHeroicRace(): Promise<void> {
    const client = new PuppeteerClient({
        headless: false,
        userAgent: fakeUa,
        corsProxyUrl: "https://proxy.marcuth.workers.dev/",
    })

    const xcrap = new Xcrap({ client: client })

    const missionModel = {
        title: {
            query: ".mh",
            extractor: extractText
        },
        goalPoints: {
            query: ".mz:nth-child(1) .m2",
            extractor: extractText
        },
        poolSize: {
            query: ".mz:nth-child(2) .m2",
            extractor: extractText
        },
        waitTimeForOne: {
            query: ".mz:nth-child(3) .m2",
            extractor: extractText
        },
        waitTimeForAll: {
            query: ".mz:nth-child(5) .m2",
            extractor: extractText
        },
        spawnChance: {
            query: ".mz:nth-child(4) .m2",
            extractor: extractText
        }
    } satisfies Model

    const nodeModel = {
        title: {
            query: ".nnh",
            extractor: extractText
        },
        missions: {
            query: ".mm",
            model: missionModel,
            isGroup: true
        }
    } satisfies Model

    const lapModel = {
        title: {
            query: ".nnh",
            extractor: extractText,
        },
        nodes: {
            query: ".nn",
            model: nodeModel,
            isGroup: true
        }
    } satisfies Model

    const rawLaps = await xcrap.scrape({
        url: "http://deetlist.com/dragoncity/events/race/",
        query: ".hl",
        model: lapModel
    })

    const missionTransformationModel = {
        title: [({ title }) => trimString(title)],
        goalPoints: [({ goalPoints }) => stringToNumber(goalPoints)],
        poolSize: [({ poolSize }) => stringToNumber(poolSize)],
        waitTime: [
            ({ waitTimeForAll, waitTimeForOne }, next) => {
                console.log({ waitTimeForAll, waitTimeForOne })

                if (isNaN(Number(waitTimeForAll))) {
                    return next({ waitTimeForAll, waitTimeForOne, anyValue: "test" })
                }

                return {
                    one: stringToNumber(waitTimeForAll),
                    all: stringToNumber(waitTimeForOne)
                }
            },
            ({ waitTimeForAll, waitTimeForOne, anyValue }) => {
                return { waitTimeForAll, waitTimeForOne, anyValue }
            }
        ],
        spawnChance: [({ spawnChance }) => stringToNumber(spawnChance)]
    } satisfies TransformationModel<ResultData<typeof missionModel>>

    const nodeTransformationModel = {
        title: [
            callNext({
                middleware: ({ title }) => title.trim(),
                resultKey: "title"
            }),
            callNext({
                middleware: ({ title }) => title.split("-"),
                resultKey: "title"
            }),
            ({ title }) => title[1].trim()
        ],
        missions: [
            ({ missions }) => {
                return missions.map(mission => {
                    return transformData({
                        data: mission as ResultData<typeof missionModel>,
                        model: missionTransformationModel
                    })
                })
            }
        ]
    } satisfies TransformationModel<ResultData<typeof nodeModel>>

    const lapTransformationModel = {
        title: [
            callNext({
                middleware: ({ title }) => title.trim(),
                resultKey: "title"
            }),
            callNext({
                middleware: ({ title }) => title.split("-"),
                resultKey: "title"
            }),
            ({ title }) => title[0].trim()
        ],
        nodes: [
            ({ nodes }) => {
                return nodes.map(node => {
                    return transformData({
                        data: node as ResultData<typeof nodeModel>,
                        model: nodeTransformationModel
                    })
                })
            }
        ]
    } satisfies TransformationModel<ResultData<typeof lapModel>>

    const laps = rawLaps.map(lap => {
        return transformData({
            data: lap as ResultData<typeof lapModel>,
            model: lapTransformationModel
        })
    })

    // await fs.promises.writeFile("laps.json", JSON.stringify(laps, null, 4))

    console.log(xcrap.getPaginationUrlsWithRange({
        initUrls: ["https://google.com/page={pageIndex}"],
        paginationRange: [1, 50]
    }))

    client.close()
}

scrapeDeetlistHeroicRace()
// async function scrapeDragonCityStore(): Promise<void> {
//     const xcrap = new Xcrap()

//     const otherItemModel: Model = {
//         icon: {
//             query: "img",
//             extractor: extractAttribute("src")
//         },
//         amount: {
//             query: "span.font-bold.text-center",
//             extractor: extractText
//         }
//     }

//     const itemModel: Model = {
//         title: {
//             query: ".tile_title__M_MTe",
//             extractor: extractText
//         },
//         stock: {
//             query: "span[class=\"[float:inline-end]\"]",
//             extractor: extractText
//         },
//         description: {
//             query: ".tile_description__n4Vtb",
//             extractor: extractText
//         },
//         otherItems: {
//             query: ".ListPackageContents_main__Peh3X button",
//             model: otherItemModel,
//             isGroup: true
//         }
//     }

//     const page = await xcrap.get("https://www.dragoncitygame.com/pt-BR")
//     const items = page.parseItemGroup(".pb-4", itemModel)

//     console.dir(items, { depth: null })
// }

// async function scrapeDragonCityNews(): Promise<void> {
//     const xcrap = new Xcrap()

//     const newsModel: Model = {
//         title: {
//             query: "header",
//             extractor: extractText
//         },
//         publishedAt: {
//             query: "time",
//             extractor: extractText
//         },
//         pageUrl: {
//             extractor: extractAttribute("href")
//         }
//     }

//     const page = await xcrap.get("https://www.dragoncitygame.com/pt-BR/dragon-city-news")
//     const newsSet = page.parseItemGroup("div a[type=button]", newsModel)

//     console.dir(newsSet, { depth: null })
// }

// scrapeDeetlistHeroicRace()