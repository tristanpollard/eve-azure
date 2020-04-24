import { Model } from 'objection'

export default class DiscordLink extends Model {
  type: string
  type_id: number
  role_id: string

  static get idColumn() {
    return ['type', 'type_id', 'role_id'];
  }

  static get tableName(): string {
    return "discord_role_mapping"
  }

  static get relationMappings() {
    const Character = require('./character').default
    const Corporation = require('./corporation').default
    const Alliance = require('./alliance').default
    return {
      characters: {
        relation: Model.BelongsToOneRelation,
        modelClass: Character,
        join: {
          from: 'discord_role_mapping.type_id',
          to: 'character.id'
        }
      },
      corporation: {
        relation: Model.BelongsToOneRelation,
        modelClass: Corporation,
        join: {
          from: 'discord_role_mapping.type_id',
          to: 'corporation.id'
        }
      },
      alliances: {
        relation: Model.BelongsToOneRelation,
        modelClass: Alliance,
        join: {
          from: 'discord_role_mapping.type_id',
          to: 'alliance.id'
        }
      }
    }
  }

}