import { IServerCommand, ICommandResponse } from './index'
import { ICommandRequest } from '..'
import DiscordAuthSession from '../../shared/models/DiscordAuthSession'

const auth: IServerCommand = {
    command: "auth",
    minArgs: 0,
    usage: "!auth",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        if (!commandRequest.guild?.id) {
            return {
                reply: {
                    message: '!auth must be ran in the context of a guild.'
                }
            }
        }
        const authUrl = `${process.env.DISCORD_AUTH_URI}/${commandRequest.guild.id}`
        await DiscordAuthSession.createOrUpdateAuthSession(commandRequest.sender.user_id, commandRequest.guild?.id)
        const response: ICommandResponse = {
            dm: {
                message: authUrl,
            }
        }
        return Promise.resolve(response)
    }
}

export default auth