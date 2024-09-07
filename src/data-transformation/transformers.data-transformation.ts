import { AnyObject } from "../common/types"

const trimString = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.trim()
    }
}

const stringToUpperCase = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.toUpperCase()
    }
}

const stringToLowerCase = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.toLowerCase()
    }
}

const sliceString = (key: string, start: number, end: number) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.slice(start, end)
    }
}

const stringToNumber = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return Number(value)
    }
}

const toInteger = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as number
        return Math.floor(value)
    }
}

const multiplyNumber = (key: string, a: number) => {
    return (data: AnyObject) => {
        const value = data[key] as number
        return value * a
    }
}

const divideNumber = (key: string, a: number) => {
    return (data: AnyObject) => {
        const value = data[key] as number
        return value / a
    }
}

const stringReplace = (key: string, search: string, replacement: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.replace(search, replacement)
    }
}

const stringSplit = (key: string, separator: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.split(separator)
    }
}

const stringToTitleCase = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value
            .toLowerCase()
            .replace(/(^\w{1})|(\s+\w{1})/g, (char) => char.toUpperCase())
    }
}

const normalizeString = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value
            .normalize("NFD")
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
    }
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
    stringReplace,
    stringSplit,
    stringToTitleCase,
    normalizeString
}