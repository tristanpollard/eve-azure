import { Model } from 'objection'

export default class Corporation extends Model {
  id?: number
  alliance_id?: number
  ceo_id: number
  creator_id: number
  date_founded?: Date
  description?: string
  faction_id?: number
  home_station_id?: number
  member_count: number
  name: string
  shares?: number
  tax_rate: number
  ticker: string
  url?: string
  war_eligible?: boolean
  created_at: Date
  updated_at: Date

  static get tableName(): string {
    return "corporation"
  }

  static get relationMappings() {
    const Alliance = require('../alliance').default
    const Character = require('../character').default
    const DiscordLink = require('../DiscordLink').default

    return {
      alliance: {
        relation: Model.BelongsToOneRelation,
        modelClass: Alliance,
        join: {
          from: 'corporation.alliance_id',
          to: 'alliance.id'
        }
      },
      characters: {
        relation: Model.HasManyRelation,
        modelClass: Character,
        join: {
          from: 'corporation.id',
          to: 'character.corporation_id'
        }
      },
      discordLink: {
        relation: Model.HasManyRelation,
        modelClass: DiscordLink,
        filter: {
          type: 'corporation'
        },
        join: {
          from: 'corporation.id',
          to: 'discord_role_mapping.type_id'
        }
      }
    }
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
}