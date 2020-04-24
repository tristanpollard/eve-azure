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
    const character = await Character.query().insertAndFetch({ ...insertData, id: characterId })
    .catch(async err => {
        if (err instanceof UniqueViolationError) {
            return await Character.query().updateAndFetchById(characterId, insertData)
        }
        throw err
    })

    var d = new Date();
    d.setSeconds(d.getSeconds() - (60*60*6))
    const corporation = await Character.relatedQuery('corporation').for(character.id).where('updated_at', '>', d).first()
    const apiMessage: IServiceBusAction | undefined = corporation ? undefined : { 
        group: "trawl",
        action: "corporation",
        data: { id: String(character.corporation_id) }
    }

    return {
        api: [
            apiMessage
        ].filter(el => el)
    }
}
