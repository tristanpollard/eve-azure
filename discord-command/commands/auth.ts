import { IServerCommand, IEmbeddedMessage, ICommandResponse } from './index'
import { ICommandRequest } from '..'

const auth: IServerCommand = {
    command: "auth",
    minArgs: 0,
    usage: "!auth",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const authUrl = process.env.DISCORD_AUTH_URI
        const response: ICommandResponse = {
            reply: {
                message: authUrl,
            }
        }
        return Promise.resolve(response)
    }
}

export default auth