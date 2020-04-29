import { Model, UniqueViolationError } from "objection"
import axios from 'axios'
import Querystring from 'querystring'
import ESIToken from "./ESIToken";
import DiscordAuthSession, { InvalidDiscordAuthSession } from "./DiscordAuthSession";

class DiscordToken extends Model {

    user_id: string
    guild: string
    access_token: string
    refresh_token: string
    username: string
    discriminator: number
    expires: Date
    flags: number
    mfa?: boolean
    locale?: string
    email?: string
    created_at: Date
    updated_at: Date

    static get idColumn(): Array<string> {
        return ['user_id', 'guild']
    }

    static get tableName(): string {
        return 'discord_tokens';
    }

    static get virtualAttributes(): Array<string> {
        return ['full_username']
    }

    static get relationMappings() {
        return {
          esi_tokens: {
            relation: Model.ManyToManyRelation,
            modelClass: ESIToken,
            join: {
              from: [
                  'discord_tokens.user_id',
                  'discord_tokens.guild'
              ],
              through: {
                from: [
                    'token_ownership.discord_user_id',
                    'token_ownership.discord_guild_id'
                ],
                to: 'token_ownership.esi_token_id'
              },
              to: 'esi_tokens.id'
            }
          }
        }
      }

    get full_username(): string {
        return `${this.username}#${this.discriminator}`
    }

    async $beforeInsert(queryContext) {
        await super.$beforeInsert(queryContext);
        this.created_at = new Date()
        this.updated_at = this.created_at
    }

    async $beforeUpdate(opt, queryContext) {
        await super.$beforeUpdate(opt, queryContext);
        this.updated_at = new Date()
    }

    isExpired() {
        return this.expires < new Date();
    }

    async refresh() {

    }

    static async verify(code: string, guild: string): Promise<DiscordToken> {
        const params = Querystring['stringify']({
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
            scope: "identify",
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET
        })

        const tokenConfig = {
            headers: {
                "content-type": 'application/x-www-form-urlencoded'
            }
        }
        const discordToken = await axios.post(process.env.DISCORD_TOKEN_URI, params, tokenConfig)
            .then(data => {
                return data.data
            })

        // TODO: move to its own file
        const infoConfig = {
            headers: {
                Authorization: `Bearer ${discordToken.access_token}`
            }
        }
        const discordInfo = await axios.get('https://discordapp.com/api/users/@me', infoConfig)
            .then(data => {
                return data.data
            })

            const session = await DiscordAuthSession.userAuthSessionForGuild(discordInfo.id, guild)
            if (!session) {
                throw new InvalidDiscordAuthSession
            }

            const expiresDate = new Date()
            expiresDate.setSeconds(expiresDate.getSeconds() + discordToken.expires_in)
            const updateInfo = {
                username: discordInfo.username,
                discriminator: discordInfo.discriminator,
                flags: discordInfo.flags,
                mfa: discordInfo.mfa_enabled,
                email: discordInfo.email,
                locale: discordInfo.locale,
                access_token: discordToken.access_token,
                refresh_token: discordToken.refresh_token,
                expires: expiresDate
            }

            const token = DiscordToken.query().insert({
                user_id: discordInfo.id,
                guild: guild,
                ...updateInfo
            }).catch(async err => {
                if (err instanceof UniqueViolationError) {
                    return await DiscordToken.query().patchAndFetchById([discordInfo.id, guild], updateInfo)
                }
                throw(err)
            })

            return token
    }

}

export default DiscordToken
