import { AzureFunction, Context } from "@azure/functions"
import { Model } from 'objection'
import Knex from 'knex'
import knexfile from '../knexfile'
import ESIToken from '../shared/models/ESIToken'
import esi from 'node-esi'
import IllegalArgumentError from '../shared/errors/IllegalArgumentError'
import { IServiceBusAction, IServiceBusDiscordAction } from "./types"
import { handleTrawlAction } from "./handlers"
import { handleDiscordAction } from "./handlers/discord"

export const knex = Knex(knexfile)

Model.knex(knex)

// @ts-ignore
esi.defaults.model = ESIToken

export const serviceBusQueueTrigger: AzureFunction = async function (context: Context, apiAction: IServiceBusAction): Promise<void> {
    console.log(apiAction)
    switch (apiAction.group) {
        case "trawl":
            const trawlAction = await handleTrawlAction(apiAction)
            context.bindings.serviceBusApiQueue = trawlAction?.api
            context.bindings.serviceBusDiscordQueue = trawlAction?.discord
            break
        case "discord":
            const discordAction = await handleDiscordAction(apiAction as IServiceBusDiscordAction)
            context.bindings.serviceBusApiQueue = discordAction?.api
            context.bindings.serviceBusDiscordQueue = discordAction?.discord
            break
        default:
            throw new IllegalArgumentError
    }
    console.log(context.bindings)
}


export default serviceBusQueueTrigger;