import { IServiceBusAction, IServiceBusActions } from "../types"
import InvalidArgumentError from "../../shared/errors/InvalidArgumentError"
import { handleAllianceAction } from "./trawl/alliance"
import { handleCharacterAction } from "./trawl/character"
import { handleCorporationAction } from "./trawl/corporation"

export const handleTrawlAction = (trawlerAction: IServiceBusAction): Promise<IServiceBusActions> => {
    switch (trawlerAction.action) {
        case "alliance":
            return handleAllianceAction(trawlerAction)
        case "character":
            return handleCharacterAction(trawlerAction)
        case "corporation":
            return handleCorporationAction(trawlerAction)
    }
    throw new InvalidArgumentError
}
