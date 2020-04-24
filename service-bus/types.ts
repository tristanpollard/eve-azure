export interface IServiceBusActions {
    api?: Array<IServiceBusAction>
    discord?: Array<IServiceBusAction>
}

export interface IServiceBusAction {
    group: string
    action: string
    target?: string
    data?: { [key: string]: any }
}

export interface IServiceBusDiscordAction extends IServiceBusAction {
    guild: string
    channel?: string
    sender?: string
}