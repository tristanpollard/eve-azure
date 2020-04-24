import { IServerCommand, ICommandResponse } from './'
import { ICommandRequest } from '../'
import { IServiceBusDiscordAction } from '../../service-bus/types'

const sync: IServerCommand = {
    command: "sync",
    minArgs: 1,
    usage: "!sync [<@role|@user>]",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const mentions = commandRequest.mentions
        const discordServiceBusRoleMessages = mentions?.roles.map((mention): IServiceBusDiscordAction => {
            return {
                group: "discord",
                action: "sync",
                target: "role",
                guild: commandRequest.guild.id,
                channel: commandRequest.channel.id,
                sender: commandRequest.sender.user_id,
                data: { id: mention.id }
            }
        })
        const discordServiceBusUserMessages = mentions?.users.map((mention): IServiceBusDiscordAction => {
            return {
                group: "discord",
                action: "sync",
                target: "user",
                guild: commandRequest.guild.id,
                channel: commandRequest.channel.id,
                sender: commandRequest.sender.user_id,
                data: { id: mention.id }
            }
        })
        return {
            reply: {
                message: "Sync in progress..."
            },
            serviceBusApiQueue: discordServiceBusRoleMessages.concat(discordServiceBusUserMessages)
        }
    }
}

export default sync