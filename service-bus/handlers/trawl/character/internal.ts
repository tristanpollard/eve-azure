import { IServiceBusActions, IServiceBusDiscordAction, IServiceBusAction } from "../../../types";
import Character from "../../../../shared/models/character";
import { getCharacterInfo } from "../../../../shared/api/public/character";

export const trawl = async (characterId: number): Promise<IServiceBusActions> => {

    const info = await getCharacterInfo(characterId)
    const insertData = {
        ...info.character,
        birthday: new Date(info.character.birthday)
    }

    const dbCharacter = await Character.query().findById(characterId)
    const didChangeCorporation = dbCharacter?.corporation_id != info.character.corporation_id
    const didChangeAlliance = dbCharacter?.alliance_id != info.character.alliance_id
    const isNewCharacter = !dbCharacter

    if (!dbCharacter) {
        await Character.query().insert({ ...insertData, id: characterId })
    } else {
        await Character.query().findById(dbCharacter.id).patch(insertData)
    }

    let discordSyncAction: IServiceBusDiscordAction | undefined = undefined
    if (didChangeAlliance || didChangeCorporation || isNewCharacter) {
        console.log(characterId, didChangeAlliance, didChangeCorporation, isNewCharacter)
        discordSyncAction = {
            group: "discord",
            action: "sync",
            target: "character",
            data: {
                id: characterId
            }
        }
    }

    var d = new Date();
    d.setSeconds(d.getSeconds() - (60*60*6))
    const corporation = await Character.relatedQuery('corporation').for(characterId).where('updated_at', '>', d).first()
    const apiMessage: IServiceBusAction | undefined = corporation ? undefined : { 
        group: "trawl",
        action: "corporation",
        data: { id: info.character.corporation_id }
    }

    return {
        api: [
            apiMessage,
            discordSyncAction
        ].filter(el => el)
    }
}