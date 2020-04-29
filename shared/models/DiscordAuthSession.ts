import { Model } from 'objection'
import IllegalArgumentError from '../errors/IllegalArgumentError'

export class InvalidDiscordAuthSession extends Error {
    
}

export default class DiscordAuthSession extends Model {
    discord_user_id: string
    discord_guild: string
    created_at: Date

    static get tableName(): string {
        return "discord_auth_sessions"
    }

    static get idColumn(): Array<string> {
        return ['discord_user_id', 'discord_guild']
    }

    /**
     * Creates an auth session for a user and guild.
     */
    static createOrUpdateAuthSession = (user: string, guild: string): Promise<any> => {
        if (!user || !guild) {
            throw new IllegalArgumentError
        }
        const query = DiscordAuthSession.query().insert({
            discord_user_id: user,
            discord_guild: guild,
            created_at: new Date()
        }).toKnexQuery().toString()
        return DiscordAuthSession.knex().raw(`${query} ON DUPLICATE KEY UPDATE created_at = VALUES(created_at)`)
    }

    /**
     * Returns a session for a user + guild. They are only valid for 10 minutes.
     */
    static userAuthSessionForGuild = (user: string, guild: string): Promise<DiscordAuthSession> => {
        const dateParam = new Date()
        dateParam.setMinutes(dateParam.getMinutes() - 10)
        return DiscordAuthSession.query().findById([user, guild]).where('created_at', '>', dateParam)
    }

}