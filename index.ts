import Xcrap, { Tracker } from "./src"

import { extractText } from "./src/extractors"
import { Model } from "./src/page"

// ;(async () => {
//     const xcrap = new Xcrap()

//     const currentPageTracker: Tracker = {
//         query: ".listlink a.active",
//         extractor: extractText
//     }

//     const lastPageTracker: Tracker = {
//         query: ".listlink a:nth-child(15)",
//         extractor: extractText
//     }

//     await xcrap.initUrlsAndPaginateWithTracker(
//         ["https://dbgames.info/dragoncity/dragons?rarity=rare&p={pageIndex}"],
//         currentPageTracker,
//         lastPageTracker
//     )

//     const pageSet = await xcrap.getAll()

//     const dragon: Model = {
//         name: {
//             query: "a",
//             extractor: extractText
//         },
//         rarity: {
//             query: "a.iconized-text",
//             extractor: extractText
//         }
//     }

//     const dragons = pageSet.parseItemGroupForAll("div.entity", dragon)

//     console.log(dragons)
// })();


import fs from "fs"

;(async () => {
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
        missions: {
            query: ".mm",
            model: missionModel,
            isArray: true
        }
    }

    const lapModel: Model = {
        lapTitle: {
            query: ".nnt",
            extractor: extractText,
        },
        nodes: {
            query: ".nn",
            model: nodeModel,
            isArray: true
        }
    }

    const page = await xcrap.get("https://deetlist.com/dragoncity/events/race/")
    const laps = page.parseItemGroup(".hl", lapModel)

    fs.writeFileSync("data.json", JSON.stringify(laps))
    
    console.dir(laps, { depth: null })
})();