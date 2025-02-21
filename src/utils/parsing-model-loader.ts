import { Extractor, ParsingModel as LoadedParsingModel } from "@parsing/index"
import * as defaultExtractors from "@parsing/extractors.parsing"

export type ExtractorGenerator = (...args: any[]) => Extractor
export type ExtractorOrExtractorGenerator = Extractor | ExtractorGenerator

export type UnloadedParsingModelValueBase = {
    query?: string
    fieldType?: "single" | "multiple"
    extractor: (keyof typeof defaultExtractors) | (string & {})
}

export type UnloadedParsingModelNestedValue = {
    query: string
    model: UnloadedParsingModel
    isGroup?: boolean
}

export type UnloadedParsingModelValue = UnloadedParsingModelValueBase | UnloadedParsingModelNestedValue


export type UnloadedParsingModel = {
    [key: string]: UnloadedParsingModelValue
}

class ParsingModelLoader {
    public constructor(
        public readonly extractors: Record<string, ExtractorOrExtractorGenerator> = defaultExtractors,
        public readonly argumentsSeparator: string = ":"
    ) {}

    public getExtractor(extractor: string): Extractor {
        if (extractor in this.extractors) {
            return this.extractors[extractor] as Extractor
        } else if (extractor.includes(this.argumentsSeparator)) {
            const [extractorName, ...args] = extractor.split(this.argumentsSeparator)
            return (this.extractors[extractorName] as ExtractorGenerator)(...args)
        }

        throw new Error(`Extractor "${extractor}" not found`)
    }

    public load(unloadedModel: UnloadedParsingModel): LoadedParsingModel {
        const loadedModel: LoadedParsingModel = {}

        for (const [key, value] of Object.entries(unloadedModel)) {
            if ("extractor" in value) {
                loadedModel[key] = {
                    query: value.query,
                    fieldType: value.fieldType ?? "single",
                    extractor: this.getExtractor(value.extractor)
                }
            } else {
                loadedModel[key] = {
                    query: value.query,
                    model: this.load(value.model),
                    isGroup: value.isGroup
                }
            }
        }

        return loadedModel
    }
}

export default ParsingModelLoader