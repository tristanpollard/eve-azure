import { IServerCommand, IEmbeddedMessage, ICommandResponse } from './index'
import { getId } from '../../shared/api/public/search'
import InvalidArgumentError from '../../shared/errors/InvalidArgumentError'
import NotFoundError from '../../shared/errors/NotFoundError'
import { ICommandRequest } from '..'

const authorizedTypes = ['alliance', 'character', 'corporation']

const trawl: IServerCommand = {
    command: "trawl",
    minArgs: 2,
    usage: "!trawl <alliance|character:<type>|corporation> <name>",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const split = commandRequest.args.split(' ')
        const type = split.shift().toLowerCase()
        if (!authorizedTypes.includes(type)) {
            throw new InvalidArgumentError
        }
        const searchName = split.join(' ')
        let id: number
        try {
            id = await getId(searchName, type)
        } catch (err) {
            if (err instanceof NotFoundError) {
                return {
                    reply: {
                        message: `Could not find ${searchName}`
                    }
                }
            }
            throw err
        }
        
        return {
            reply: {
                message: `Trawling queued for ${searchName}`
            },
            serviceBusApiQueue: [
                {
                    group: "trawl",
                    action: type,
                    data: {
                        id
                    }
                }
            ]
        }
    }
}

export default trawl