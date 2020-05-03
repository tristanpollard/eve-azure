import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import ESIToken from "../../../../shared/models/ESIToken"
import { IServiceBusAction, IServiceBusActions } from "../../../types"
import { trawl as trawlWallet } from './character-wallet'
import { trawl as trawlPublicCharacter } from './public-character'
import { trawl as trawlInternalCharacter } from './internal'

export const handleCharacterAction = async (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const id = trawlerAction.data?.id
    if (!id) {
        throw new IllegalArgumentError
    }
    const tokens = await ESIToken.query().where('character_id', id)
    const tokenWithScope = (scope: string): ESIToken | undefined => {
        return tokens.find(tok => {
            return tok.scopes.has(scope)
        })
    }
    switch (trawlerAction.target) {
        case undefined:
            return {
                api: [
                    // TODO: collapse tokenWithScope calls
                    tokenWithScope('esi-wallet.read_character_wallet.v1') ? {
                        group: "trawl",
                        action: "character",
                        target: "wallet",
                        data: {
                            id,
                        }
                    } : null,
                    !tokens.length ? {
                        group: "trawl",
                        action: "character",
                        target: "public",
                        data: {
                            id
                        }
                    } : null,
                    tokens.length ? {
                        group: "trawl",
                        action: "character",
                        target: "internal",
                        data: {
                            id
                        }
                    } : null
                ].filter(el => el)
            }
        case "public":
            return trawlPublicCharacter(id)
        case "internal":
            return trawlInternalCharacter(id)
        case "wallet":
            const token = tokenWithScope('esi-wallet.read_character_wallet.v1')
            if (!token) {
                throw new IllegalArgumentError
            }
            trawlWallet(token)
            return {}
        default:
            throw new IllegalArgumentError
    }
}