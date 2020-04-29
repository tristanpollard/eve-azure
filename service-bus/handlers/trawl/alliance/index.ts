import { IServiceBusAction, IServiceBusActions } from "../../../types"
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import { trawl as trawlAlliance } from './public-alliance'

export const handleAllianceAction = async (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const id = trawlerAction.data.id
    if (!id) {
        throw new IllegalArgumentError
    }
    switch (trawlerAction.target) {
        case undefined:
            return trawlAlliance(id)
        default:
            throw new IllegalArgumentError

    }
}