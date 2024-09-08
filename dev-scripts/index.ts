// import fakeUa from "fake-useragent"


// import { extractInnerText, ParsingModel, PuppeteerClient, PuppeteerClientAction } from "../src"

// const randomizeViewportSize: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         const width = 1920 + Math.floor(Math.random() * 100)
//         const height = 3000 + Math.floor(Math.random() * 100)

//         await page.setViewport({
//             width: width,
//             height: height,
//             deviceScaleFactor: 1,
//             hasTouch: false,
//             isLandscape: false,
//             isMobile: false,
//         })
//     }
// }

// const skipAssetsLoading: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.setRequestInterception(true)

//         page.on("request", async (request) => {
//             const isAssets = (
//                 request.resourceType() == "stylesheet" ||
//                 request.resourceType() == "font" ||
//                 request.resourceType() == "image"
//             )

//             if (isAssets) {
//                 await request.abort()
//             } else {
//                 await request.continue()
//             }
//         })
//     }
// }

// const passWebdriverCheck: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.evaluateOnNewDocument(() => {
//             Object.defineProperty(navigator, "webdriver", {
//                 get: () => false
//             })
//         })
//     }
// }

// const passChromeCheck: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.evaluateOnNewDocument(() => {
//             (window as any).chrome = {
//                 runtime: {}
//             }
//         })
//     }
// }

// const passNotificationsCheck: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.evaluateOnNewDocument(() => {
//             const originalQuery = window.navigator.permissions.query as any
            
//             return window.navigator.permissions.query = (parameters) => {
//                 return parameters.name === "notifications" ? 
//                     Promise.resolve({ state: Notification.permission }) :
//                     originalQuery(parameters)
//             }
//         })
//     }
// }

// const mockPlugins: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.evaluateOnNewDocument(() => {
//             Object.defineProperty(navigator, "plugins", {
//                 get: () => [1, 2, 3, 4, 5],
//             })
//         })
//     }
// }

// const mockLanguages: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.evaluateOnNewDocument(() => {
//             Object.defineProperty(navigator, "languages", {
//                 get: () => ["en-US", "en"],
//             })
//         })
//     }
// }

// const hideAutomationExtensions: PuppeteerClientAction = {
//     type: "beforeRequest",
//     func: async (page) => {
//         await page.evaluateOnNewDocument(() => {
//             Object.defineProperty(navigator, "webdriver", {
//                 get: () => undefined
//             })

//             delete (navigator as any).__proto__.webdriver
//         })
//     }
// }

// ;(async () => {
//     const client = new PuppeteerClient({
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         userAgent: fakeUa
//     })

//     const pageParser = await client.get({
//         url: "https://www.terabyteshop.com.br/produto/17216/monitor-gamer-superframe-vision-24pol-fullhd-165hz-hdmidp-sfv2409s",
//         actions: [
//             randomizeViewportSize,
//             skipAssetsLoading,
//             passWebdriverCheck,
//             passChromeCheck,
//             passNotificationsCheck,
//             mockPlugins,
//             mockLanguages,
//             hideAutomationExtensions
//         ]
//     })

//     const pageParserModel = {
//         title: {
//             query: "title",
//             extractor: extractInnerText
//         }
//     } satisfies ParsingModel

//     const pageData = pageParser.parseItem({ model: pageParserModel })

//     console.log(pageData.title)

//     await client.close()
// })();