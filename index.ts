import Xcrap from "./src"

import { extractAttribute, extractText } from "./src/extractors"
import { Model } from "./src/page"

async function scrapeDeetlistHeroicRace(): Promise<void> {
    const xcrap = new Xcrap()

    const missionModel: Model = {
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
    }

    const nodeModel: Model = {
        title: {
            query: ".nnh",
            extractor: extractText
        },
        missions: {
            query: ".mm",
            model: missionModel,
            isGroup: true
        }
    }

    const lapModel: Model = {
        title: {
            query: ".nnh",
            extractor: extractText,
        },
        nodes: {
            query: ".nn",
            model: nodeModel,
            isGroup: true
        }
    }

    const page = await xcrap.get("https://deetlist.com/dragoncity/events/race/")
    const laps = page.parseItemGroup(".hl", lapModel)
    
    console.dir(laps, { depth: null })
}

async function scrapeDragonCityStore(): Promise<void> {
    const xcrap = new Xcrap()

    const otherItemModel: Model = {
        icon: {
            query: "img",
            extractor: extractAttribute("src")
        },
        amount: {
            query: "span.font-bold.text-center",
            extractor: extractText
        }
    }

    const itemModel: Model = {
        title: {
            query: ".tile_title__M_MTe",
            extractor: extractText
        },
        stock: {
            query: "span[class=\"[float:inline-end]\"]",
            extractor: extractText
        },
        description: {
            query: ".tile_description__n4Vtb",
            extractor: extractText
        },
        otherItems: {
            query: ".ListPackageContents_main__Peh3X button",
            model: otherItemModel,
            isGroup: true
        }
    }

    const page = await xcrap.get("https://www.dragoncitygame.com/pt-BR")
    const items = page.parseItemGroup(".pb-4", itemModel)

    console.dir(items, { depth: null })
}

async function scrapeDragonCityNews(): Promise<void> {
    const xcrap = new Xcrap()

    const newsModel: Model = {
        title: {
            query: "header",
            extractor: extractText
        },
        publishedAt: {
            query: "time",
            extractor: extractText
        },
        pageUrl: {
            extractor: extractAttribute("href")
        }
    }

    const page = await xcrap.get("https://www.dragoncitygame.com/pt-BR/dragon-city-news")
    const newsSet = page.parseItemGroup("div a[type=button]", newsModel)

    console.dir(newsSet, { depth: null })
}

scrapeDeetlistHeroicRace()