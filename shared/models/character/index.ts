import { Model } from 'objection'

export default class Character extends Model {
  id: number
  alliance_id?: number
  ancestry_id?: number
  birthday: Date
  bloodline_id: number
  corporation_id: number
  description?: string
  faction_id?: number
  gender: "female" | "male"
  name: string
  race_id: number
  security_status?: number
  title?: string
  created_at: Date
  updated_at: Date

  static get tableName(): string {
    return "character"
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

  static get relationMappings() {
    const Corporation = require('../corporation').default
    const Alliance = require('../alliance').default
    const ESIToken = require('../ESIToken').default
    const DiscordLink = require('../DiscordLink').default
    return {
      corporation: {
        relation: Model.BelongsToOneRelation,
        modelClass: Corporation,
        join: {
          from: 'character.corporation_id',
          to: 'corporation.id'
        }
      },
      alliance: {
        relation: Model.HasOneThroughRelation,
        modelClass: Alliance,
        join: {
          from: 'character.corporation_id',
          through: {
            from: 'corporation.id',
            to: 'corporation.alliance_id'
          },
          to: 'alliance.id'
        }
      },
      discordLink: {
        relation: Model.HasManyRelation,
        modelClass: DiscordLink,
        filter: {
          type: 'character'
        },
        join: {
          from: 'character.id',
          to: 'discord_role_mapping.type_id'
        }
      },
      token: {
        relation: Model.HasOneRelation,
        modelClass: ESIToken,
        join: {
          from: 'character.id',
          to: 'esi_tokens.character_id'
        }
      }
    }
  }
}