import who from './who'
import auth from './auth'
import link from './link/link'
import unlink from './link/unlink'
import trawl from './trawl'
import tokens from './tokens'
import { ICommandRequest } from '..'
import sync from './sync'
import { IServiceBusAction } from '../../service-bus/types'

const commands: { [name: string]: IServerCommand } = {}
commands[who.command] = who
commands[auth.command] = auth
commands[link.command] = link
commands[unlink.command] = unlink
commands[trawl.command] = trawl
commands[tokens.command] = tokens
commands[sync.command] = sync

export default commands

export interface IServerCommand {
    command: string
    minArgs?: number
    maxArgs?: number
    usage: string
    perform: (commandRequest: ICommandRequest) => Promise<ICommandResponse>
}

// TODO: share w/ client
export interface IResponse {
    message: string,
    embed?: IEmbeddedMessage
}

export interface IChannelResponse {
    channel: string,
    response: IResponse
}

export interface ICommandResponse {
    reply?: IResponse
    dm?: IResponse
    channelResponse?: IChannelResponse,
    serviceBusApiQueue?: Array<IServiceBusAction>
}

export interface IEmbeddedField {
    name: string,
    value: string,
    inline?: boolean
}

export interface IEmbeddedMessage {
    title: string,
    color?: string,
    url?: string,
    fields?: Array<IEmbeddedField>,
    image?: string,
    thumbnail?: string
}