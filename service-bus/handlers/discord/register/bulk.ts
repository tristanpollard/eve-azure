import { IServiceBusDiscordAction, IServiceBusActions } from "../../../types"
import DiscordGuild  from '../../../../shared/models/DiscordGuild'
import IllegalArgumentError from "../../../../shared/errors/IllegalArgumentError"
import { knex } from '../../../index'

export const handleDiscordGuildBulkRegister = async (serviceBusAction: IServiceBusDiscordAction): Promise<IServiceBusActions> => {
    const guilds: Array<string> = serviceBusAction.data.guildIds
    if (!guilds) {
        throw new IllegalArgumentError
    }

    // clear guilds that aren't active for 7d
    const deleteDate = new Date()
    deleteDate.setDate(deleteDate.getDate() - 7)
    const promises: Array<Promise<any>> = []
    promises.push(DiscordGuild.query().delete().whereNotIn('id', guilds).where('updated_at', '<', deleteDate))

    const insertValues: Array<any> = guilds.reduce((values, guildId) => {
        const thisGuild = {
            id: guildId,
            joined_at: new Date(),
            updated_at: new Date()
        }
        values.push(thisGuild)
        return values
    }, [])
    const query = await knex(DiscordGuild.tableName).insert(insertValues).toString()
    const fullQuery = `${query} ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`
    promises.push(knex.raw(fullQuery))

    await Promise.all(promises)

    return { }
}