import DiscordToken from "../../../../shared/models/DiscordToken"
import { IServiceBusDiscordAction, IServiceBusActions, IServiceBusAction } from "../../../types"
import DiscordLink from "../../../../shared/models/DiscordLink"
import { IDiscordSyncAction } from "."
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"

export const handleDiscordGuildSync = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    
    if (!serviceBusAction.guild) {
        throw new IllegalArgumentError
    }
    
    const discordRoles = await DiscordLink.query().where('guild', serviceBusAction.guild)
    const discordRoleActions: Array<IServiceBusDiscordAction> = discordRoles.map(el => {
        return {
            group: 'discord',
            action: 'sync',
            target: 'role',
            guild: serviceBusAction.guild,
            data: { id: el.role_id }
        }
    })
    console.log(discordRoleActions)
    return {
        api: discordRoleActions
    }
}