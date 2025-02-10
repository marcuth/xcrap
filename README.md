<div style="text-align: center;font-weight: 500;">“If I have seen further, it is by standing on the shoulders of giants.”</div>

## Technologies used:

- [node-html-parser](https://www.npmjs.com/package/node-html-parser)
- [axios](https://www.npmjs.com/package/axios)
- [puppeteer](https://www.npmjs.com/package/puppeteer)

## Books I read:
- Web Scraping with Python: Data Extraction from the Modern Web:
    - [PT-BR](https://encurtador.com.br/svq8Y)
    - [EN](https://encurtador.com.br/5dS11)

## Friends I've been arguing with:
- Rafael F.: https://github.com/justonedev42/

---

# Xcrap: A Web Scraping Framework for JavaScript

Xcrap is a framework written in TypeScript to handle data extraction in web pages.

---

Data extraction works based on two types of models:

## ParsingModel

Each model key receives a `query` which is a CSS selector, and an `extractor` which is a function that will extract a certain property from an HTML element. It also accepts that the field has multiple results by passing the information in the `fieldType`, the model also supports alignment, so you can put models inside models to obtain a complex data structure, you can also define that it is a group of objects through the `isGroup` property, but don't get too attached to the resulting data structure.

## TransformationModel

Each model key receives an array of functions called `middlewares`. These `middlewares` work in a similar way to those we are used to when creating a backend server, I may or may not call the next middleware. It is not necessary for the key to actually exist in the `ParsingModel` you used for data extraction, each function will receive an object containing all the keys from the extraction result, so structure the data however you want.

## Clients

### Default Clients

Xcrap comes by default with two clients, `AxiosClient` and `PuppeteerClient` which respectively use [`Axios`](https://npmjs.com/package/axios) and [`Puppeteer`](https://www.npmjs.com/package/puppeteer) to handle HTTP requests and retrieve the HTML of a website.

---

###  Custom Clients

If you want to use another library to handle HTTP requests or even customize something that happens from one request to another, you can make your own custom client by extending the `BaseClient` class.

Here is an example of how [`PuppeteerExtaClient` (xcrap-puppeteer-extra-client)](https://www.npmjs.com/package/xcrap-puppeteer-extra-client) was made:

```ts
import { PuppeteerClientOptions } from "xcrap/dist/clients/puppeteer.client"
import puppeteer,  { PuppeteerExtraPlugin } from "puppeteer-extra"
import { PuppeteerClient } from "xcrap"

export type PuppeteerExtraClientOptions = PuppeteerClientOptions & {
    plugins?: PuppeteerExtraPlugin[]
}

class PuppeteerExtraClient extends PuppeteerClient {
    public constructor(options: PuppeteerExtraClientOptions = {}) {
        super(options)

        if (options.plugins) {
            for (const plugin of options.plugins) {
                this.usePlugin(plugin)
            }
        }
    }

    protected async initBrowser(): Promise<void> {
        const puppeteerArguments: string[] = []

        if (this.proxy) {
            const currentProxy = typeof this.proxy === "function" ?
                this.proxy() :
                this.proxy

            puppeteerArguments.push(`--proxy-server=${currentProxy}`)
        }

        if (this.options.args && this.options.args.length > 0) {
            puppeteerArguments.push(...this.options.args)
        }

        this.browser = await puppeteer.launch({
            ...this.options,
            args: puppeteerArguments,
            headless: this.options.headless ? "shell" : false
        })
    }

    public usePlugin(plugin: PuppeteerExtraPlugin): void {
        puppeteer.use(plugin)
    }
}

export default PuppeteerExtraClient
```
