import { IServiceBusAction, IServiceBusActions } from "../../../types"
import InvalidArgumentError from "../../../../shared/errors/InvalidArgumentError"
import { trawl as trawlAlliance } from './public-alliance'

export const handleAllianceAction = async (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const id = trawlerAction.data.id
    if (!id) {
        throw new InvalidArgumentError
    }
    switch (trawlerAction.target) {
        case undefined:
            return trawlAlliance(id)
        default:
            throw new InvalidArgumentError

    }
}