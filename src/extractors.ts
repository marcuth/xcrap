import { HTMLElement } from "node-html-parser"

function extractText(element: HTMLElement): string {
    const text = element.innerText
    return text
}

const extractAttribute = (name: string) => (element: HTMLElement): string => {
    const attribute = element.attrs[name]
    return attribute ?? ""
}

export {
    extractText,
    extractAttribute
}