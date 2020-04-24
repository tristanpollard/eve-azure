import { IServiceBusAction, IServiceBusActions } from "../../../types"
import InvalidArgumentError from "../../../../shared/errors/InvalidArgumentError"
import { trawl as trawlPublicCorporation } from './public-corporation'

export const handleCorporationAction = async (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const id = trawlerAction.data.id
    if (!id) {
        throw new InvalidArgumentError
    }
    switch (trawlerAction.target) {
        case undefined:
            return trawlPublicCorporation(id)
        default:
            throw new InvalidArgumentError
    }
}