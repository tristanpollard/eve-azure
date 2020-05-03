import Character from '../../../../shared/models/character'
import { getCharacterInfo } from '../../../../shared/api/public/character'
import { UniqueViolationError} from 'objection'
import { IServiceBusActions, IServiceBusAction } from '../../../types'

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
        const character = await Character.query().insertAndFetch({ ...insertData, id: characterId })
    } else {
        await Character.query().for(dbCharacter.id).patch(insertData)
    }

    var d = new Date();
    d.setSeconds(d.getSeconds() - (60*60*6))
    const corporation = await Character.relatedQuery('corporation').for(characterId).where('updated_at', '>', d).first()
    const apiMessage: IServiceBusAction | undefined = corporation ? undefined : { 
        group: "trawl",
        action: "corporation",
        data: { id: String(info.character.corporation_id) }
    }

    if (didChangeAlliance || didChangeCorporation || isNewCharacter) {
        // do sync
    }

    return {
        api: [
            apiMessage
        ].filter(el => el)
    }
}
