import { Model, UniqueViolationError } from "objection"
import axios from 'axios'
import Querystring from 'querystring'
import ESIToken from "./ESIToken";

class DiscordToken extends Model {

    static get tableName(): string {
        return 'discord_tokens';
    }

    static get idColumn(): string {
        return 'user_id'
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
              from: 'discord_tokens.user_id',
              through: {
                from: 'token_ownership.discord_user_id',
                to: 'token_ownership.character_id'
              },
              to: 'esi_tokens.character_id'
            }
          }
        }
      }

    user_id: string
    access_token: string
    refresh_token: string
    username: string
    discriminator: number
    created_at: Date
    updated_at: Date
    expires: Date
    flags: number
    mfa?: boolean
    locale?: string
    email?: string

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

    static async verify(code: string): Promise<DiscordToken> {
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
                ...updateInfo
            }).catch(async err => {
                if (err instanceof UniqueViolationError) {
                    return await DiscordToken.query().updateAndFetchById(discordInfo.id, updateInfo)
                }
                throw(err)
            })

            return token
    }

}

export default DiscordToken
