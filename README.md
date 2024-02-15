# Xcrap: A JavaScript Web Scraping Framework

Xcrap is a Web Scraping framework for JavaScript, designed to facilitate the process of extracting data from multiple pages or even just one, with a sophisticated page parsing system.

---

## A simple demonstration of the HTML parsing system:

```js
const {
    default: Xcrap,
    extractInnerText
} = require("xcrap")

;(async () => {
    const xcrap = new Xcrap()

    const missionModel = {
        title: {
            query: ".mh",
            extractor: extractInnerText
        },
        goalPoints: {
            query: ".mz:nth-child(1) .m2",
            extractor: extractInnerText
        },
        poolSize: {
            query: ".mz:nth-child(2) .m2",
            extractor: extractInnerText
        },
        waitTimeForOne: {
            query: ".mz:nth-child(3) .m2",
            extractor: extractInnerText
        },
        waitTimeForAll: {
            query: ".mz:nth-child(5) .m2",
            extractor: extractInnerText
        },
        spawnChance: {
            query: ".mz:nth-child(4) .m2",
            extractor: extractInnerText
        }
    }

    const nodeModel = {
        title: {
            query: ".nnh",
            extractor: extractInnerText
        },
        missions: {
            query: ".mm",
            model: missionModel,
            isGroup: true
        }
    }

    const lapModel = {
        title: {
            query: ".nnh",
            extractor: extractInnerText,
        },
        nodes: {
            query: ".nn",
            model: nodeModel,
            isGroup: true
        }
    }

    const page = await xcrap.get("https://deetlist.com/dragoncity/events/race/")
    const laps = page.parseItemGroup(".hl", lapModel)
    
    console.log(laps)
})();
```

**Running this code, you will get something like this:**

```js
[
  {
    title: ' Lap 1 - Node 1 ',
    nodes: [ [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    title: ' Lap 2 - Node 1 ',
    nodes: [ [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    title: ' Lap 3 - Node 1 ',
    nodes: [ [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    title: ' Lap 4 - Node 1 ',
    nodes: [ [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    title: ' Lap 5 - Node 1 ',
    nodes: [ [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    title: ' Lap 6 - Node 1 ',
    nodes: [ [Object], [Object], [Object], [Object], [Object] ]
  },
...
```