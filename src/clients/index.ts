import PuppeteerClient, { PuppeteerClientAction, PuppeteerClientActionType, PuppeteerClientActionFunction } from "./puppeteer.client"
import BaseClient, { Client } from "./base.client"
import AxiosClient from "./axios.client"

export type {
    PuppeteerClientActionFunction,
    PuppeteerClientActionType,
    PuppeteerClientAction,
    Client
}

export {
    BaseClient,
    PuppeteerClient,
    AxiosClient
}