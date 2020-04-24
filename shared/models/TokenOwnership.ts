import { Model } from 'objection'

export default class AuthorizationSession extends Model {
    character_id: number
    discord_user_id: string

    static get idColumn(): Array<string> {
        return ['character_id', 'discord_user_id'];
      }

    static get tableName(): string {
        return "token_ownership"
    }
}