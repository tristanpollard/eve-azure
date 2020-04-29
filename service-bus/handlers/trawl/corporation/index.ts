import { IServiceBusAction, IServiceBusActions } from "../../../types"
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import { trawl as trawlPublicCorporation } from './public-corporation'

export const handleCorporationAction = async (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const id = trawlerAction.data.id
    if (!id) {
        throw new IllegalArgumentError
    }
    switch (trawlerAction.target) {
        case undefined:
            return trawlPublicCorporation(id)
        default:
            throw new IllegalArgumentError
    }
}