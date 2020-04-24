import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import Token from '../shared/models/ESIToken'
import { Model, UniqueViolationError } from 'objection'
import Knex from 'knex'
import knexfile from '../knexfile'
import { getAndVerifyToken, InvalidTokenResponse, TokenExpiredError, IDiscordCookiePayload } from '../shared/authorization'
import TokenNotFoundError from '../shared/errors/TokenNotFoundError'
import DiscordToken from '../shared/models/DiscordToken'
import TokenOwnership from '../shared/models/TokenOwnership'
import { IServiceBusAction } from "../service-bus/types"

const knex = Knex(knexfile)

Model.knex(knex)

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const state = req.query.state
    const code = req.query.code
    if (!code || !state) {
        context.res = {
            status: 403,
            body: "Invalid authorization code"
        }
    }

    const cookieHeader = req.headers.cookie
    let discordToken: IDiscordCookiePayload
    try {
        discordToken = getAndVerifyToken(cookieHeader)
    } catch (err) {
        if (err instanceof TokenNotFoundError || err instanceof TokenExpiredError) { 
            context.res = InvalidTokenResponse
            return
        }
        throw err
    }
    
    const trx = await DiscordToken.startTransaction()
    let eveToken: Token
    try {
        const discordUser = await DiscordToken.query(trx).findById(discordToken.discord_user_id)
        // TODO: relationship
        eveToken = await Token.verify(code, trx)
        const tokenOwnership = await TokenOwnership.query(trx).insert({
            character_id: eveToken.character_id,
            discord_user_id: discordUser.user_id
        }).catch(err => {
            if (err instanceof UniqueViolationError) {
                // no need to upsert as only values are the PK
                return
            }
            throw err
        })
        await trx.commit()
    } catch (err) {
        await trx.rollback()
        throw err
    }

    context.res = {
        body: "Success! Return to discord."
    }

    const messages: Array<IServiceBusAction> = [
        {
            group: "trawl",
            action: "character",
            data: { id: eveToken.character_id }
        }
    ]
    
    context.bindings.serviceBusApiQueue = messages
};

export default httpTrigger;
