import { IServiceBusActions, IServiceBusDiscordAction } from "../../../types";
import ESIToken from "../../../../shared/models/ESIToken";

export const handleDiscordCharacterSync = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    console.log(serviceBusAction)
    const character = serviceBusAction.data.id
    if (!character) {
        console.log('no character specified')
        return
    }

    const tokens = await ESIToken.query().where('character_id', character).withGraphJoined('discord')
    const discordActions: Array<IServiceBusDiscordAction> = tokens.reduce((prev, curr) => {
        prev.push(
            {
                group: 'discord',
                action: 'sync',
                target: 'user',
                // @ts-ignore
                guild: curr.discord.guild,
                data: {
                    // @ts-ignore
                    id:  curr.discord.user_id
                }
            }
        )
        return prev
    }, [])
    
    return Promise.resolve({
        api: discordActions
    })
}