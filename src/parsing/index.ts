import HtmlParser, { HtmlParsingModel, HtmlParserResultData, Extractor } from "./html-parser.parsing"
import JsonParser, { JsonParsingModel, JsonParserResultData } from "./json-parser.parsing"
import HtmlParserList from "./html-parser-list.parsing"
import JsonParserList from "./json-parser-list.parsing"

export * from "./extractors.parsing"

export type SingleParser<T> = HtmlParser | JsonParser<T>
export type MultipleParser<T> = HtmlParserList | JsonParserList<T>

export type SingleParserType = typeof HtmlParser | typeof JsonParser
export type MultipleParserType = typeof HtmlParserList | typeof JsonParserList

export type {
    HtmlParsingModel,
    HtmlParserResultData,
    Extractor,
    JsonParsingModel,
    JsonParserResultData
}

export {
    HtmlParserList,
    HtmlParser,
    JsonParser
}

export * from "./html-parser-list.parsing"