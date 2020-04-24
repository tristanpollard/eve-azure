import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import DiscordToken from '../shared/models/DiscordToken'
import { signJwt, IDiscordCookiePayload } from '../shared/authorization'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const code = req.query.code
    if (!code) {
        context.res = {
            status: 403,
            body: "Invalid authorization code"
        }
    }

    const token = await DiscordToken.verify(code)
    const jwtPayload: IDiscordCookiePayload = {
        discord_user_id: token.user_id,
        discord_name: token.full_username
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
