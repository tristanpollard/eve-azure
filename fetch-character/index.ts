import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { getFullCharacterInfoFromName } from '../shared/api/public/character'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const characterName = req.query.character ?? req.body?.character
    if (characterName) {
        const character = await getFullCharacterInfoFromName(characterName)
        context.res = {
            body: character
        }
    } else {
        context.res = {
            status: 400,
            body: { error: "Character required" }
        };
    }
}

export default httpTrigger