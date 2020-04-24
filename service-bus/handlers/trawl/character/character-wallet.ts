import esi from 'node-esi'
import Wallet from '../../../../shared/models/character/wallet'
import Token from '../../../../shared/models/ESIToken'
import { UniqueViolationError } from 'objection'
import { IServiceBusActions } from '../../../types'

export const trawl = async (token: Token): Promise<IServiceBusActions> => {
    const balance = (await request(token)).data
    await Wallet.query().insert({
        character_id: token.character_id,
        balance
    })
    .catch(async err => {
        if (err instanceof UniqueViolationError) {
            return await Wallet.query().updateAndFetchById(token.character_id, {
                balance
            })
        }
        throw err
    })
    return { }
}

export const request = (token: Token): Promise<any> => {
    // @ts-ignore
    return esi(`/characters/${token.character_id}/wallet/`, { token })
}