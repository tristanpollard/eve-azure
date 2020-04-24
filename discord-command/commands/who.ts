import { IServerCommand, IEmbeddedMessage, ICommandResponse } from './index'
import { getFullCharacterInfoFromName, ICharacterInfo } from "../../shared/api/public/character"
import { ICommandRequest } from '..'

const who: IServerCommand = {
    command: "who",
    minArgs: 1,
    usage: "!who sumo sabezan",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const characterInfo = await getFullCharacterInfoFromName(commandRequest.args)
        const embed: IEmbeddedMessage = {
            title: characterInfo.character.name,
            color: "#0099ff",
            url: "https://zkillboard.com/character/" + characterInfo.id,
            fields: [
                characterInfo.corporation?.corporation.name ? { name: "Corporation", value: characterInfo.corporation.corporation.name } : undefined,
                characterInfo.corporation?.alliance?.alliance.name ? { name: "Alliance", value: characterInfo.corporation?.alliance.alliance.name } : undefined
            ].filter(function(el) { return el != undefined }),
            thumbnail: "https://images.evetech.net/characters/" + characterInfo.id + "/portrait?size=128"
        }
        const response: ICommandResponse = {
            reply: {
                message: characterInfo.character.name,
                embed: embed
            }
        }
        return Promise.resolve(response)
    }
}

export default who