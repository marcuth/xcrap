import HtmlParser, { ParsingModel, ResultData, Extractor } from "./html-parser.parsing"
import HtmlParserList from "./html-parser-list.parsing"

export * from "./extractors.parsing"

export type {
    ParsingModel,
    ResultData,
    Extractor
}

export {
    HtmlParserList,
    HtmlParser
}

export * from "./html-parser-list.parsing"