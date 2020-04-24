import { Model } from 'objection'

export default class AuthorizationSession extends Model {
    discord_user_id: string
    code: string
    created_at: Date

    static get idColumn(): string {
        return 'discord_user_id';
      }

    static get tableName(): string {
        return "authorization_sessions"
    }

    async $beforeInsert(context) {
        super.$beforeInsert(context)
        this.created_at = new Date()
    }

    get isValid(): boolean {
        const checkDate = this.created_at
        // only valid for 5 minutes
        checkDate.setMinutes(checkDate.getMinutes() + 5) 
        return checkDate > new Date()
    }
}