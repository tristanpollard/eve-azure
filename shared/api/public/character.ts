import esi from 'node-esi'
import { Response_get_characters_character_id_200, Response_get_corporations_corporation_id_200, Response_get_alliances_alliance_id_200 } from '../esi-types';
import { getFullCorporation, ICorporation } from './corporation'
import { getAlliance, IAlliance } from './alliance'
import { getId } from './search'

export interface ICharacterInfo {
    id: number,
    character: Response_get_characters_character_id_200,
    corporation?: ICorporation
}

export const getCharacterInfo = (characterId: number): Promise<ICharacterInfo> => {
    return esi('characters/' + characterId).then(data => {
        return {
            id: characterId,
            character: data.data
        }
    });
}

export const getFullCharacterInfoFromName = async (character: string): Promise<ICharacterInfo> => {
    const characterId = await getId(character, "character")
    if (!characterId) { return }
    const characterInfo = await getCharacterInfo(characterId)
    if (!characterInfo) { return }
    const corporationInfo = await getFullCorporation(characterInfo.character.corporation_id)
    return {
        id: characterId,
        character: characterInfo.character,
        corporation: corporationInfo
    }
}