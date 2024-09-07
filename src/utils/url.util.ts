export type DataItem = {
    [key: string]: any
}

function preProcessUrls(urlTemplate: string, data: DataItem[]): string[] {
    const urls: string[] = []

    for (const dataItem of data) {
        const url = urlTemplate.replace(/\{([^}]+)\}/g, (_, key) => dataItem[key])
        urls.push(url)
    }

    return urls
}

export { preProcessUrls }