import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import { handleDiscordUserSync } from "./user"
import { handleDiscordRoleSync } from "./role"

export interface IDiscordSyncAction {
    role?: {
        id: string
        member_ids: Array<string>
    }
    member?: {
        id: string
        role_ids: Array<string>
        remove_role_ids: Array<string>
    }

}

export const handleDiscordSyncAction = (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    switch (serviceBusAction.target) {
        case 'user':
            return handleDiscordUserSync(serviceBusAction)
        case 'role':
            return handleDiscordRoleSync(serviceBusAction)
    }
    throw new IllegalArgumentError
}