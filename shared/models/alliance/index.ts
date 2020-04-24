import { Model } from 'objection'

export default class Alliance extends Model {
  id: number
  creator_corporation_id: number
  creator_id: number;
  date_founded: Date;
  executor_corporation_id?: number;
  faction_id?: number;
  name: string;
  ticker: string;
  created_at: Date
  updated_at: Date

  static get tableName(): string {
    return "alliance"
  }

  static get relationMappings() {
    const Corporation = require('../corporation').default
    const Character = require('../character').default
    const DiscordLink = require('../DiscordLink').default

    return {
      corporations: {
        relation: Model.HasManyRelation,
        modelClass: Corporation,
        join: {
          from: 'alliance.id',
          to: 'corporation.alliance_id'
        }
      },
      characters: {
        relation: Model.HasManyRelation,
        modelClass: Character,
        join: {
          from: 'alliance.id',
          through: {
            from: 'corporation.alliance_id',
            to: 'corporation.id'
          },
          to: 'character.id'
        }
      },
      discordLink: {
        relation: Model.HasManyRelation,
        modelClass: DiscordLink,
        filter: {
          type: 'alliance'
        },
        join: {
          from: 'alliance.id',
          to: 'discord_role_mapping.type_id'
        }
      }
    }
  };

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