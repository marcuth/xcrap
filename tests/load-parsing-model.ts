import ParsingModelLoader, { UnloadedParsingModel } from "../src/utils/parsing-model-loader"

const parsingModelLoader = new ParsingModelLoader()

const unloadedModel = {
    title: {
        query: "title",
        extractor: "extractInnerText",
    },
    images: {
        query: ".image",
        extractor: "extractAttribute:src",
        fieldType: "multiple",
    },
    jobs: {
        query: ".job",
        isGroup: true,
        model: {
            title: {
                query: "h2",
                extractor: "extractInnerText",
            },
            company: {
                query: ".company",
                extractor: "extractInnerText",
            },
            location: {
                query: ".location",
                extractor: "extractInnerText",
            },
            link: {
                query: "a",
                extractor: "extractAttribute:href",
            },
        }
    }
} satisfies UnloadedParsingModel

const loadedModel = parsingModelLoader.load(unloadedModel)

console.dir(loadedModel, { depth: null })