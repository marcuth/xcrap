import transformData, { TransformationModel, callNext } from "./data-transformer"
import Page, { Model, ResultData } from "./page"
import PageSet from "./page-set"
import Xcrap from "./xcrap"

export * from "./data-transformer/transformers"
export * from "./clients"
export * from "./extractors"
export * from "./utils"

export { Page, PageSet, transformData, callNext }
export type { Model, TransformationModel, ResultData }

export default Xcrap