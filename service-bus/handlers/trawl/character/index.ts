import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import ESIToken from "../../../../shared/models/ESIToken"
import { IServiceBusAction, IServiceBusActions } from "../../../types"
import { trawl as trawlWallet } from './character-wallet'
import { trawl as trawlPublicCharacter } from './public-character'

export const handleCharacterAction = async (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const id = trawlerAction.data?.id
    if (!id) {
        throw new IllegalArgumentError
    }
    const token = await ESIToken.query().findById(id)
    switch (trawlerAction.target) {
        case undefined:
            return {
                api: [
                    token ? {
                        group: "trawl",
                        action: "character",
                        target: "wallet",
                        data: {
                            id
                        }
                    } : null,
                    {
                        group: "trawl",
                        action: "character",
                        target: "public",
                        data: {
                            id
                        }
                    }
                ].filter(el => el)
            }
        case "public":
            return trawlPublicCharacter(id)
        case "wallet":
            trawlWallet(token)
            return {}
        default:
            throw new IllegalArgumentError
    }
}