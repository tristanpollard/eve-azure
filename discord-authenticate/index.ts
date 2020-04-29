import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import DiscordToken from '../shared/models/DiscordToken'
import { signJwt, IDiscordCookiePayload } from '../shared/authorization'
import DiscordAuthSession, { InvalidDiscordAuthSession } from "../shared/models/DiscordAuthSession";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const code = req.query.code
    const guild = req.query.state
    if (!code || !guild) {
        context.res = {
            status: 403,
            body: "Invalid authorization code/guild."
        }
        return
    }

    const token = await DiscordToken.verify(code, guild)
    .catch(err => {
        if (err instanceof InvalidDiscordAuthSession) {
            context.res = {
                status: 403,
                body: "User auth session not found, you must run the !auth command again."
            }
            return
        }
        context.res = {
            status: 403,
            body: "Invalid discord token"
        }
    })
    if (!token) {
        return
    }

    const jwtPayload: IDiscordCookiePayload = {
        discord_user_id: token.user_id,
        discord_name: token.full_username,
        guild: guild
    }
    const authorizationJwt = signJwt(jwtPayload)

    context.res = {
        status: 302,
        headers: { "location": `/api/eve-authorize` },
        cookies: [
            {
                name: "DISCORD_AUTHORIZATION",
                value: authorizationJwt,
                maxAge: 60 * 10,
                httpOnly: true,
                secure: true
            }
        ]
    };
};

export default httpTrigger;
