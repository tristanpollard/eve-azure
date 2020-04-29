import jwt from 'jsonwebtoken'
import TNFE from '../errors/TokenNotFoundError'
import TEE from 'jsonwebtoken/lib/TokenExpiredError'

export const TokenNotFoundError = TNFE
export const TokenExpiredError = TEE

export class TokenIncorrectGuildError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export interface IDiscordCookiePayload {
    discord_user_id: string,
    discord_name: string,
    guild: string
}

export const InvalidTokenResponse: { [key: string]: any } = {
    status: 403,
    body: 'Authorization expired, please restart the process.'
}

export const signJwt = (payload: { [key: string]: any }): string => {
    const jwtPrivate = process.env.JWT_PRIVATE_KEY.replace(/(\\n)/gm,"\n");
    return jwt.sign(payload, jwtPrivate, { expiresIn: 60 * 10, algorithm: 'RS256' })
}

export const getAndVerifyToken = (cookies: string): IDiscordCookiePayload => {
    const jwtPublic = process.env.JWT_PUBLIC_KEY.replace(/(\\n)/gm,"\n");
    const token = jwt.verify(getToken(cookies), jwtPublic)
    return token
}

export const getAndVerifyTokenGuild = (cookies: string, guild: string): IDiscordCookiePayload => {
    const token = getAndVerifyToken(cookies)
    if(token.guild != guild) {
        throw new TokenIncorrectGuildError
    }
    return token
}

export const getToken = (cookies: String): string => {
    const cookiesArray: Array<Array<string>> = cookies?.split(";")?.map(value => value?.trim().split("="))
    const mappedCookies: { [cookieName: string]: string } = cookiesArray?.reduce((map, obj) => {
        map[obj[0]] = obj[1];
        return map;
    }, {});
    const discordToken = mappedCookies?.DISCORD_AUTHORIZATION
    if (!discordToken) {
        throw new TokenNotFoundError
    }
    return discordToken
}