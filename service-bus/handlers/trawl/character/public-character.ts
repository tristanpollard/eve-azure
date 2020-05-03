import Character from '../../../../shared/models/character'
import { getCharacterInfo } from '../../../../shared/api/public/character'
import { UniqueViolationError } from 'objection'
import { IServiceBusActions, IServiceBusAction, IServiceBusDiscordAction } from '../../../types'
import IllegalArgumentError from '../../../../shared/errors/IllegalArgumentError'

export const trawl = async (serviceBusAction: IServiceBusAction): Promise<IServiceBusActions> => {
    const characterId = serviceBusAction.data?.id
    if (!characterId) {
        throw new IllegalArgumentError
    }
    const info = await getCharacterInfo(characterId)
    const insertData = {
        ...info.character,
        birthday: new Date(info.character.birthday)
    }

    await Character.query().insert({ ...insertData, id: characterId })
        .catch(async err => {
            if (err instanceof UniqueViolationError) {
                await Character.query().findById(characterId).patch(insertData)
            }
            throw err
        })

    var d = new Date();
    d.setSeconds(d.getSeconds() - (60 * 60 * 6))
    const corporation = await Character.relatedQuery('corporation').for(characterId).where('updated_at', '>', d).first()
    const apiMessage: IServiceBusAction | undefined = corporation ? undefined : {
        group: "trawl",
        action: "corporation",
        data: { id: info.character.corporation_id }
    }

    return {
        api: [
            apiMessage
        ].filter(el => el),
    }
}
