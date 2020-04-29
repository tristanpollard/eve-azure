import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import DiscordGuild from "../../../../shared/models/DiscordGuild"
import { knex } from '../../../index'
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"

export const handleDiscordGuildRegister = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    const guild = serviceBusAction.guild
    if (!guild) {
        throw new IllegalArgumentError
    }

    const insertGuild = [
        {
            id: guild,
            joined_at: new Date(),
            updated_at: new Date()
        }
    ]
    const query = await knex(DiscordGuild.tableName).insert(insertGuild).toString()
    const fullQuery = `${query} ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`
    await knex.raw(fullQuery)

    return {}
}