import PuppeteerClient, { PuppeteerClientAction, PuppeteerClientActionType, PuppeteerClientActionFunction, defaultActionType, ExtractActionsResult } from "./puppeteer.client"
import BaseClient, { Client, defaultUserAgent } from "./base.client"
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
    AxiosClient,
    defaultActionType as defaultPuppeteerActionType,
    defaultUserAgent
}