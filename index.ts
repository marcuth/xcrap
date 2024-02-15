import Xcrap from "./src"

import { extractAttribute, extractText } from "./src/extractors"
import { Model } from "./src/page"

;(async () => {
    const xcrap = new Xcrap()

    xcrap.initUrls(["https://deetlist.com/dragoncity/all-dragons/"])

    const pageSet = await xcrap.getAll()

    pageSet.forEach(page => {
        const model: Model = {
            pageUrl: {
                extractor: extractAttribute("href")
            },
            name: {
                query: ".drag",
                extractor: extractText
            }
        }

        const items = page.parseItemGroup("a:has(.drag)", model)

        console.log(items)
    })

    const imageSources = pageSet[0].parseAll("img", extractAttribute("src"))

    console.log(imageSources)
})();