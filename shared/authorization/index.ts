import jwt from 'jsonwebtoken'
import TokenNotFoundError from '../errors/TokenNotFoundError'

export { TokenNotFoundError }

export interface IDiscordCookiePayload {
    discord_user_id: string,
    discord_name: string
}

export { TokenExpiredError } from 'jsonwebtoken/lib/TokenExpiredError'

export const InvalidTokenResponse: { [key: string]: any } = {
    status: 302,
    headers: { location: "/api/discord-authorize" }
}

export const signJwt = (payload: { [key: string]: any }): string => {
    return jwt.sign(payload, process.env.JWT_PRIVATE_KEY, { expiresIn: 60 * 10, algorithm: 'RS256' })
}

export const getAndVerifyToken = (cookies: string): IDiscordCookiePayload => {
    return jwt.verify(getToken(cookies), process.env.JWT_PUBLIC_KEY)
}

export const getToken = (cookies: String): string => {
    const cookiesArray: Array<Array<string>> = cookies.split(";").map(value => value.trim().split("="))
    const mappedCookies: { [cookieName: string]: string } = cookiesArray.reduce((map, obj) => {
        map[obj[0]] = obj[1];
        return map;
    }, {});
    const discordToken = mappedCookies.DISCORD_AUTHORIZATION
    if (!discordToken) {
        throw new TokenNotFoundError
    }
    return discordToken
}