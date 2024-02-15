import { HTMLElement } from "node-html-parser"

function extractInnerText(element: HTMLElement): string {
    const text = element.innerText
    return text ?? ""
}

function extractTextContent(element: HTMLElement): string {
    const text = element.textContent
    return text ?? ""
}

function extractText(element: HTMLElement): string {
    const text = element.text
    return text ?? ""
}

function extractInnerHtml(element: HTMLElement): string {
    const html = element.innerHTML
    return html ?? ""
}

const extractAttribute = (name: string) => (element: HTMLElement): string => {
    const attribute = element.attrs[name]
    return attribute ?? ""
}

export {
    extractInnerText,
    extractTextContent,
    extractText,
    extractInnerHtml,
    extractAttribute
}