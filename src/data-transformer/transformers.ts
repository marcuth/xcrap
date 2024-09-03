const trimString = (text: string): string => text.trim()
const stringToUpperCase = (text: string): string => text.toUpperCase()
const stringToLowerCase = (text: string): string => text.toLowerCase()
const sliceString = (start: number, end: number) => (text: string) => text.slice(start, end)
const stringToNumber = (text: string): number => Number(text)
const toInteger = (value: number): number => Math.floor(value)
const multiplyNumber = (a: number) => (b: number) => b * a
const divideNumber = (a: number) => (b: number) => b / a
const stringReplace = (search: string, replacement: string) => (text: string) => text.replace(search, replacement)
const stringSplit = (separator: string) => (text: string) => text.split(separator)

const stringToTitleCase = (str: string): string => {
    return str
        .toLowerCase()
        .replace(
            /(^\w{1})|(\s+\w{1})/g,
            stringToUpperCase
        )
}

const normalizeString = (str: string): string => {
    const normalizedString = str
        .normalize("NFD")
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, "")
        .trim()

    return normalizedString
}

export {
    trimString,
    stringToUpperCase,
    stringToLowerCase,
    sliceString,
    stringToNumber,
    toInteger,
    multiplyNumber,
    divideNumber,
    stringToTitleCase,
    normalizeString,
    stringReplace,
    stringSplit
}