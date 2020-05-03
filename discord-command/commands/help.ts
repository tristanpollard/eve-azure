import { IServerCommand, IEmbeddedMessage, ICommandResponse } from './index'
import { ICommandRequest } from '..'
import commands from './'

const help: IServerCommand = {
    command: "help",
    minArgs: 0,
    usage: "!help",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const sortedCommandEntries = Object.entries(commands).sort()
        const commandList = sortedCommandEntries.reduce((prev, [key, val]) => {
            prev.push([val.command, val.usage].join(' - '))
            return prev
        }, []).join("\n")
        return {
            dm: {
                message: commandList
            }
        }
    }
}

export default help