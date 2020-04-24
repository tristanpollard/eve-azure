import { IDiscordSyncAction } from "."
import DiscordLink from "../../../../shared/models/DiscordLink"
import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"

export const handleDiscordRoleSync = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    const roleMentionId: string = serviceBusAction.data.id
    const discordIds = await DiscordLink.query()
        .where('role_id', roleMentionId)
        .where('type', 'corporation')
        // TODO: no need to grab all the fields
        .withGraphFetched('corporation.characters.token.discord')
        .then(data => {
            return data.reduce((prev, curr) => {
                // @ts-ignore
                const chars: Array<any> = curr.corporation?.characters
                const discordIds = chars?.map(char => char?.token?.discord.user_id) ?? []
                return prev.concat(discordIds)
            }, [])
        })
    const data: IDiscordSyncAction = {
        role: {
            id: roleMentionId,
            member_ids: discordIds
        }
    }
    return {
        discord: [
            {
                group: 'sync',
                action: 'role',
                target: serviceBusAction.guild,
                data
            }
        ]
    }
}