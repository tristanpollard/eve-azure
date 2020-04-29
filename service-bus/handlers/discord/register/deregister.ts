import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import DiscordGuild from "../../../../shared/models/DiscordGuild"

export const handleDiscordGuildDeregister = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    const guild = serviceBusAction.guild
    if (!guild) {
        throw new IllegalArgumentError
    }

    await DiscordGuild.query().delete().for(guild)

    return {}
}