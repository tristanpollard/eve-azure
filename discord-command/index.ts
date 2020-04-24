import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import commands from './commands'

export interface IMention {
    id: string
    name: string
    mentionable: boolean
}

export interface IMentionUser extends IMention {
    nick?: string
    discriminator: string
    avatar: string
}

export interface IMentionRole extends IMention {
    color: number
}

export interface IMentions {
    users?: Array<IMentionUser>
    roles?: Array<IMentionRole>
    channels?: Array<IMention>
}

export interface IChannel {
    id: string
}

export interface IGuild {
    id: string
}

export interface ICommandRequest {
    command: string
    args: string
    sender: ISender
    mentions?: IMentions
    flags?: Array<string>
    channel?: IChannel
    guild?: IGuild
}

export interface ISender {
    user_id: string
    username: string
    nickname?: string
    discriminator: string
    roles: Array<string>
    channel: string
    guild: string
    administrator: boolean
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const commandRequest: ICommandRequest = req.body
    const command = commands[commandRequest.command]
    if (command) {
        console.log(command)
        const commandResponse = await command.perform(commandRequest)
        console.log(commandResponse)
        context.res = {
            body: commandResponse
        }
        context.bindings.serviceBusApiQueue = commandResponse.serviceBusApiQueue
        console.log(context.bindings.serviceBusApiQueue)
    } else {
        context.res = {
            status: 400,
            body: "Please pass a valid command"
        };
    }
};

export default httpTrigger;
