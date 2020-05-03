import { Model, UniqueViolationError, Transaction } from "objection"
import axios from 'axios'
import jwt from 'jsonwebtoken'

class ESIToken extends Model {

  id: number
  character_id: number
  access_token: string
  refresh_token: string
  character_name: string
  expires: Date
  created_at: Date
  updated_at: Date
  deleted_at?: Date

  static get tableName(): string {
    return 'esi_tokens';
  }

  static get virtualAttributes(): Array<string> {
    return ['decoded_token', 'scopes']
  }

  get decoded_token(): any {
    return jwt.decode(this.access_token)
  }

  get scopes(): Set<string> {
    return new Set(this.decoded_token.scp)
  }

  static get relationMappings() {
    const DiscordToken = require('./DiscordToken').default
    const Character = require('./character').default
    return {
      character: {
        relation: Model.BelongsToOneRelation,
        modelClass: Character,
        join: {
          from: 'esi_tokens.character_id',
          to: 'character.id'
        }
      },
      discord: {
        relation: Model.HasOneThroughRelation,
        modelClass: DiscordToken,
        join: {
          from: 'esi_tokens.id',
          through: {
            from: 'token_ownership.esi_token_id',
            to: [
              'token_ownership.discord_user_id',
              'token_ownership.discord_guild_id'
            ]
          },
          to: [
            'discord_tokens.user_id',
            'discord_tokens.guild'
          ]
        }
      }
    }
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.updateFieldsFromAccessToken()
    this.created_at = new Date()
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.updateFieldsFromAccessToken()
  }

  isExpired() {
    return this.expires < new Date();
  }

  async refresh() {
    try {
      const r = await axios.post(
        process.env.SSO_TOKEN_URI,
        { grant_type: "refresh_token", refresh_token: this.refresh_token },
        {
          auth: {
            username: process.env.SSO_CLIENT_ID,
            password: process.env.SSO_SECRET
          }
        }
      );
      this.access_token = r.data.access_token;
      this.refresh_token = r.data.refresh_token;
      return this;
    } catch (err) {
      if (err.response.status === 400) {
        await this.$query().patch({ deleted_at: new Date() })
        throw "Token revoked";
      } else {
        throw "Token refresh failed...";
      }
    }
  }

  static async verify(access_token: string, trx?: Transaction): Promise<ESIToken> {
    const config = {
      auth: {
        username: process.env.SSO_CLIENT_ID,
        password: process.env.SSO_SECRET
      }
    }
    const params = { grant_type: "authorization_code", code: access_token }
    const r = await axios.post(process.env.SSO_TOKEN_URI, params, config)
    const character_id = jwt.decode(r.data.access_token).sub.split(":").pop()
    const model = {
      access_token: r.data.access_token,
      refresh_token: r.data.refresh_token
    }

    const token = await ESIToken.query(trx).insert(model)
      .catch(async err => {
        if (err instanceof UniqueViolationError) {
          return await ESIToken.query(trx).patchAndFetchById(character_id, model)
        }
        throw err
      })
    return token
  }

  private updateFieldsFromAccessToken() {
    this.updated_at = new Date()
    this.character_id = this.decoded_token.sub.split(":").pop()
    this.character_name = this.decoded_token.name
    this.expires = new Date(this.decoded_token.exp * 1000)
  }

}

export default ESIToken
