import { Model } from 'objection'

export default class TokenOwnership extends Model {
    esi_token_id: number
    discord_user_id: string
    discord_guild_id: string

    static get idColumn(): Array<string> {
        return ['esi_token_id', 'discord_token_id', 'discord_guild_id'];
      }

    static get tableName(): string {
        return "token_ownership"
    }

    static get relationMappings() {
        const ESIToken = require('./ESIToken').default
        return {
            esi_token: {
                relation: Model.HasOneRelation,
                modelClass: ESIToken,
                join: {
                  from: 'token_ownership.esi_token_id',
                  to: 'esi_tokens.id'
                }
              }
        }
    }
}