import Xcrap from "./src"

import { extractText } from "./src/extractors"
import { Model } from "./src/page"

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
})();