import { IDiscordSyncAction } from "."
import DiscordLink from "../../../../shared/models/DiscordLink"
import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"

export const handleDiscordRoleSync = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    const roleMentionId: string = serviceBusAction.data.id
    if (!roleMentionId || !serviceBusAction.guild) {
        throw new IllegalArgumentError
    }
    const corpIdPromise = DiscordLink.query()
        .where('role_id', roleMentionId)
        .where('type', 'corporation')
        .where('guild', serviceBusAction.guild)
        .withGraphFetched('corporation.characters.tokens.discord(boundToGuild)')
        .modifiers({
            boundToGuild(builder) {
                builder.where('guild', serviceBusAction.guild)
            }
        })
        .then(data => {
            return data.reduce((prev, curr) => {
                // @ts-ignore
                const chars: Array<any> = curr.corporation?.characters
                //const discordIds = chars?.map(char => char?.token?.discord?.user_id).filter(el => el) ?? []
                const discordIds = chars?.reduce((prev, curr) => {
                    return prev.concat(curr.tokens?.map(token => token.discord?.user_id))
                }, [])
                return prev.concat(discordIds)
            }, []).filter(el => el)
        })

    const allianceIdPromise = DiscordLink.query()
        .where('role_id', roleMentionId)
        .where('type', 'alliance')
        .where('guild', serviceBusAction.guild)
        .withGraphFetched('alliances.characters.tokens.discord(boundToGuild)')
        .modifiers({
            boundToGuild(builder) {
                builder.where('guild', serviceBusAction.guild)
            }
        })
        .then(data => {
            return data.reduce((prev, curr) => {
                // @ts-ignore
                const chars: Array<any> = curr.alliance?.characters
                //const discordIds = chars?.map(char => char?.token?.discord?.user_id).filter(el => el) ?? []
                const discordIds = chars?.reduce((prev, curr) => {
                    return prev.concat(curr.tokens?.map(token => token.discord?.user_id))
                }, [])
                return prev.concat(discordIds)
            }, []).filter(el => el)
        })

    const characterIdPromise = DiscordLink.query()
        .where('role_id', roleMentionId)
        .where('type', 'character')
        .where('guild', serviceBusAction.guild)
        .withGraphFetched('characters.tokens.discord(boundToGuild)')
        .modifiers({
            boundToGuild(builder) {
                builder.where('guild', serviceBusAction.guild)
            }
        })
        .then(data => {
            return data.reduce((prev, curr) => {
                // @ts-ignore
                const chars: Array<any> = curr.characters
                //const discordIds = chars?.map(char => char?.token?.discord?.user_id).filter(el => el) ?? []
                const discordIds = chars?.reduce((prev, curr) => {
                    return prev.concat(curr.tokens?.map(token => token.discord?.user_id))
                }, [])
                return prev.concat(discordIds)
            }, []).filter(el => el)
        })

    const promises = [corpIdPromise, allianceIdPromise, characterIdPromise]
    const [corpIds, allianceIds, characterIds] = await Promise.all(promises)
    const combinedIds = allianceIds.concat(corpIds, characterIds)

    const data: IDiscordSyncAction = {
        role: {
            id: roleMentionId,
            member_ids: Array.from(new Set(combinedIds))
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