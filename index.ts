import Xcrap, { Tracker } from "./src"

import { extractText } from "./src/extractors"
import { Model } from "./src/page"

;(async () => {
    const xcrap = new Xcrap()

    const currentPageTracker: Tracker = {
        query: ".listlink a.active",
        extractor: extractText
    }

    const lastPageTracker: Tracker = {
        query: ".listlink a:nth-child(15)",
        extractor: extractText
    }

    await xcrap.initUrlsAndPaginateWithTracker(
        ["https://dbgames.info/dragoncity/dragons?rarity=rare&p={pageIndex}"],
        currentPageTracker,
        lastPageTracker
    )

    const pageSet = await xcrap.getAll()

    const dragon: Model = {
        name: {
            query: "a",
            extractor: extractText
        },
        rarity: {
            query: "a.iconized-text",
            extractor: extractText
        }
    }

    const dragons = pageSet.parseItemGroupForAll("div.entity", dragon)

    console.log(dragons)
})();