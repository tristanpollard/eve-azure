import { Model } from 'objection'

export default class CharacterWallet extends Model {
    character_id: number
    balance: number
    updated_at: Date

    static get idColumn() {
        return ['character_id'];
      }

    static get tableName(): string {
        return "character_wallet_balance"
    }
    
    
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    this.updated_at = new Date()
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date()
  }
}