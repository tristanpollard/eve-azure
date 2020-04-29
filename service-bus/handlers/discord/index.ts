import { IServiceBusDiscordAction, IServiceBusActions } from "../../types"
import IllegalArgumentError from "../../../shared/errors/IllegalArgumentError"
import { handleDiscordSyncAction } from "./sync"
import { handleDiscordRegisterAction } from "./register"

export const handleDiscordAction = (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    switch (serviceBusAction.action) {
        case 'sync':
            return handleDiscordSyncAction(serviceBusAction)
        case 'register':
            return handleDiscordRegisterAction(serviceBusAction)
    }
    throw new IllegalArgumentError
}