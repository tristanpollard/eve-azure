import { IServiceBusDiscordAction, IServiceBusActions } from "../../types"
import InvalidArgumentError from "../../../shared/errors/InvalidArgumentError"
import { handleDiscordSyncAction } from "./sync"

export const handleDiscordAction = (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    switch (serviceBusAction.action) {
        case 'sync':
            return handleDiscordSyncAction(serviceBusAction)
    }
    throw new InvalidArgumentError
}