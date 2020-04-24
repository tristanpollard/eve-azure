import { IServerCommand, IEmbeddedMessage, ICommandResponse } from './index'
import { Model } from 'objection'
import Knex from 'knex'
import knexConfig from '../../knexfile'
import { ICommandRequest, IMentionUser, ISender } from '..'
import DiscordToken from '../../shared/models/DiscordToken'
import InvalidArgumentError from '../../shared/errors/InvalidArgumentError'
import ESIToken from '../../shared/models/ESIToken'
import { TokenNotFoundError } from '../../shared/authorization'

const knex = Knex(knexConfig)
Model.knex(knex)

const charactersForDiscordId = (id: string): Promise<ICommandResponse> => {
    return DiscordToken.relatedQuery('esi_tokens')
        .select('character_name')
        .for(id)
        .orderBy('character_name', 'asc')
        .then(data => {
            if (!data || !data?.length) {
                throw new TokenNotFoundError
            }
            return {
                reply: {
                    // @ts-ignore
                    message: data.map(token => { return token.character_name }).join(", ")
                }
            }
    })
}

const handleMention = (mention: IMentionUser): Promise<ICommandResponse> => {
    return charactersForDiscordId(mention.id)
}

const handleEmpty = (sender: ISender): Promise<ICommandResponse> => {
    return charactersForDiscordId(sender.user_id)
}

const handleCharacter = async (name: string): Promise<ICommandResponse> => {
    return ESIToken.query()
    .withGraphFetched('discord.esi_tokens')
    .where('character_name', name)
    .first()
    .then(data => {
        // @ts-ignore
        if (!data?.discord?.esi_tokens) {
            throw new TokenNotFoundError
        }
        return {
            reply: {
                // @ts-ignore
                message: data?.discord?.esi_tokens?.map(token => { return token.character_name }).join(", ")
            }
        }
    })
}

const handleCommand = (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
    const mention = commandRequest.mentions?.users?.shift()

    if (mention && commandRequest.args.split(" ").length == 1) {
        return handleMention(mention)
    } else if (commandRequest.args && !mention) {
        return handleCharacter(commandRequest.args)
    } else if (!commandRequest.args) {
        return handleEmpty(commandRequest.sender)
    } else {
        throw new InvalidArgumentError
    }
}

const tokens: IServerCommand = {
    command: "tokens",
    minArgs: 0,
    usage: "!tokens <character_name|@discord username|null>",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        return handleCommand(commandRequest)
        .catch(err => {
            if (err instanceof TokenNotFoundError) {
                return {
                    reply: {
                        message: `Could not find tokens for ${commandRequest.args ?? commandRequest.sender.username}`
                    }
                }
            }
            throw err
        })
    }
}

export default tokens