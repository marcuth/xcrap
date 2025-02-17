import * as dateFns from "date-fns"

import { AnyObject } from "../common/types"

export type StringToBooleanOptions = {
    truthy?: string[]
    falsy?: string[]
    default?: boolean | null
}

export type ParseCurrencyOptions = {
    currencySymbol?: string
}

export type FormatCurrencyOptions = {
    locale: string
    currencyCode: string
    minimumFractionDigits?: number
}

export type ParseFormmatedNumberOptions = {
    suffixes?: Record<string, number>
    defaultValue?: number | null
    sanitizenumberstring?: (value: string) => string
}

export const defaultMinimumFractionDigits = 2

export const defaultFormattedNumberSuffixes = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
    t: 1_000_000_000_000,
    q: 1_000_000_000_000_000,
    qq: 1_000_000_000_000_000_000
} satisfies Record<string, number>

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

const stringDateToISO = (key: string, dateStringTemplate: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return dateFns.parse(value, dateStringTemplate, new Date()).toISOString()
    }
}

const stringDateToTimestamp = (key: string, dateStringTemplate: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return dateFns.parse(value, dateStringTemplate, new Date()).getTime()
    }
}
const stringDateToObject = (key: string, dateStringTemplate: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return dateFns.parse(value, dateStringTemplate, new Date())
    }
}

const stringToBoolean = (key: string, options?: StringToBooleanOptions) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        const truthyValues = options?.truthy || ["true", "1", "yes"]
        const falsyValues = options?.falsy || ["false", "0", "no"]

        if (truthyValues.includes(value.toLowerCase())) return true
        if (falsyValues.includes(value.toLowerCase())) return false

        return options?.default ?? null
    }
}

const removeHtmlTags = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string;
        return value.replace(/<\/?[^>]+(>|$)/g, "")
    }
}

const sanitizeString = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string;
        return value.replace(/[^a-zA-Z0-9\s]/g, "").trim()
    }
}

const collapseWhitespace = (key: string) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        return value.replace(/\s+/g, " ").trim()
    }
}

const parseCurrency = (key: string, options: ParseCurrencyOptions) => {
    return (data: AnyObject) => {
        const value = data[key] as string
        let cleanedValue = value

        if (options.currencySymbol) {
            cleanedValue = cleanedValue.replace(new RegExp(`\\${options.currencySymbol}`, "g"), "")
        }

        cleanedValue = cleanedValue.replace(/[,]/g, "").trim()

        return Number(cleanedValue)
    }
}

const formatCurrency = (key: string, options: FormatCurrencyOptions) => {
    return (data: AnyObject) => {
        const value = data[key] as number
        return new Intl.NumberFormat(options.locale, {
            style: "currency",
            currency: options.currencyCode,
            minimumFractionDigits: options?.minimumFractionDigits ?? defaultMinimumFractionDigits,
        }).format(value)
    }
}

const parseFormattedNumber = (
    key: string,
    options?: ParseFormmatedNumberOptions
) => {
    return (data: AnyObject) => {
        const sanitizenumberstring = options?.sanitizenumberstring ?? (
            (value) => value.toLowerCase().replace(",", ".").trim()
        )

        const value = sanitizenumberstring(data[key] as string)

        const suffixes = options?.suffixes || defaultFormattedNumberSuffixes

        for (const [suffix, multiplier] of Object.entries(suffixes)) {
            if (value.endsWith(suffix)) {
                const num = Number(value.replace(suffix, "").trim()) * multiplier
                return isNaN(num) ? options?.defaultValue ?? null : num
            }
        }

        const num = Number(value)

        return isNaN(num) ? options?.defaultValue ?? null : num
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
    normalizeString,
    stringDateToISO,
    stringDateToTimestamp,
    stringDateToObject,
    stringToBoolean,
    removeHtmlTags,
    sanitizeString,
    collapseWhitespace,
    parseCurrency,
    formatCurrency,
    parseFormattedNumber
}