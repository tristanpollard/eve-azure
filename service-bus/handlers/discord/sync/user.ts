import DiscordToken from "../../../../shared/models/DiscordToken"
import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import DiscordLink from "../../../../shared/models/DiscordLink"
import { IDiscordSyncAction } from "."
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"

export const handleDiscordUserSync = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    const userMentionId: string = serviceBusAction.data.id
    if (!userMentionId || !serviceBusAction.guild) {
        throw new IllegalArgumentError
    }
    const roleIds: Array<string> = await DiscordToken.query()
        .findById([userMentionId, serviceBusAction.guild])
        .withGraphFetched('esi_tokens.character.[discordLink, corporation.[discordLink, alliance.discordLink]]')
        .first()
        .then(data => {
            // @ts-ignore
            const tokens: Array<any> = data.esi_tokens
            return tokens?.reduce((prev, curr) => {
                const characterLinks = curr.character?.discordLink ?? []
                const corpLinks = curr.character?.corporation?.discordLink ?? []
                const allianceLinks = curr.character?.corporation?.alliance?.discordLink ?? []
                return prev.concat(characterLinks, corpLinks, allianceLinks)
            }, []).map(el => el.role_id)
        })
    const uniqueRoleIds = [... new Set(roleIds)]
    const removeRoleIds = await DiscordLink.query().whereNotIn('role_id', uniqueRoleIds)
    const data: IDiscordSyncAction = {
        member: {
            id: userMentionId,
            role_ids: uniqueRoleIds,
            remove_role_ids: removeRoleIds.map(el => el.role_id)
        }
    }
    return {
        discord: [
            {
                group: 'sync',
                action: 'user',
                target: serviceBusAction.guild,
                data
            }
        ]
    }
}