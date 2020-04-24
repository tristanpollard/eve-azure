import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getAndVerifyToken, TokenExpiredError, TokenNotFoundError } from '../shared/authorization'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const oauthUrl = process.env.DISCORD_AUTH_REDIRECT_URI

    const cookieHeader = req.headers.cookie
    try {
        getAndVerifyToken(cookieHeader)
    } catch (err) {
        if (err instanceof TokenNotFoundError || err instanceof TokenExpiredError) { 
            context.res = {
                status: 302, headers: { location: oauthUrl }
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
