import { Model } from 'objection'

export default class DiscordGuild extends Model {
  id: string
  joined_at: Date
  updated_at: Date

  static get tableName(): string {
    return "discord_guilds"
  }

}