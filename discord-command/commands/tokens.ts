import { IServerCommand, ICommandResponse } from './index'
import { Model } from 'objection'
import Knex from 'knex'
import knexConfig from '../../knexfile'
import { ICommandRequest, IMentionUser, ISender } from '..'
import IllegalArgumentError from '../../shared/errors/IllegalArgumentError'
import ESIToken from '../../shared/models/ESIToken'
import { TokenNotFoundError } from '../../shared/authorization'
import TokenOwnership from '../../shared/models/TokenOwnership'

const knex = Knex(knexConfig)
Model.knex(knex)

const charactersForDiscordId = (id: string, guild: string): Promise<ICommandResponse> => {
    return TokenOwnership.query()
        .where('discord_user_id', id)
        .where('discord_guild_id', guild)
        .withGraphFetched('esi_token')
        .then(data => {
            const charNames = data.reduce((prev, curr) => {
                // @ts-ignore
                prev.push(curr.esi_token.character_name)
                return prev
            }, []).sort()
            if (!charNames || !charNames?.length) {
                throw new TokenNotFoundError
            }
            return {
                reply: {
                    message: charNames?.join(", ")
                }
            }
        })
}

const handleMention = (mention: IMentionUser, guild: string): Promise<ICommandResponse> => {
    return charactersForDiscordId(mention.id, guild)
}

const handleEmpty = (sender: ISender, guild: string): Promise<ICommandResponse> => {
    return charactersForDiscordId(sender.user_id, guild)
}

const handleCharacter = async (name: string, guild: string): Promise<ICommandResponse> => {
    return ESIToken.query()
        .withGraphFetched('discord(tiedToGuild).esi_tokens')
        .modifiers({
            tiedToGuild(builder) {
                builder.where('guild', guild)
            }
        })
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
        return handleMention(mention, commandRequest.guild.id)
    } else if (commandRequest.args && !mention) {
        return handleCharacter(commandRequest.args, commandRequest.guild.id)
    } else if (!commandRequest.args) {
        return handleEmpty(commandRequest.sender, commandRequest.guild.id)
    } else {
        throw new IllegalArgumentError
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