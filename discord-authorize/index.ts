import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TokenExpiredError, TokenNotFoundError, TokenIncorrectGuildError, getAndVerifyTokenGuild } from '../shared/authorization'
import DiscordGuild from "../shared/models/DiscordGuild";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const oauthUrl = process.env.DISCORD_AUTH_REDIRECT_URI
    const guild = await DiscordGuild.query().findById(req.params.guild)
    if (!guild) {
        context.res = {
            status: 404,
            body: "Guild not found"
        }
        return
    }

    const cookieHeader = req.headers.cookie
    
    try {
        getAndVerifyTokenGuild(cookieHeader, guild.id)
    } catch (err) {
        if (err instanceof TokenNotFoundError || err instanceof TokenExpiredError || err instanceof TokenIncorrectGuildError) {
            const queryStringParams = {
                client_id: process.env.DISCORD_CLIENT_ID,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
                response_type: 'code',
                scope: 'identify',
                state: guild.id
            }
            const queryString = Object.entries(queryStringParams).reduce((prev, [key, value]) => {
                prev.push(`${key}=${escape(value)}`)
                return prev
            }, []).join("&") 
            context.res = {
                status: 302, headers: { location: `${oauthUrl}?${queryString}` }
            };
            return
        }
        throw err
    }

    context.res = {
        status: 302, headers: { location: "/api/eve-authorize" }
    }

};

export default httpTrigger;
