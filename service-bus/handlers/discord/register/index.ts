import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import { handleDiscordGuildRegister } from "./register"
import { handleDiscordGuildDeregister } from "./deregister"
import { handleDiscordGuildBulkRegister } from './bulk'

export const handleDiscordRegisterAction = (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    switch (serviceBusAction.target) {
        case 'bulkSetGuilds':
            return handleDiscordGuildBulkRegister(serviceBusAction)
        case 'register':
            return handleDiscordGuildRegister(serviceBusAction)
        case 'deregister':
            return handleDiscordGuildDeregister(serviceBusAction)
    }
    throw new IllegalArgumentError
}