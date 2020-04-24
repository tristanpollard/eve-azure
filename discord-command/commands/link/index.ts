import { getAllianceInfoFromName } from '../../../shared/api/public/alliance'
import { getFullCharacterInfoFromName } from '../../../shared/api/public/character'
import { getCorporationInfoFromName } from '../../../shared/api/public/corporation'

export const authorizedTypes = ["alliance", "character", "corporation"]

export interface ILinkResolution {
    type: string
    id: number
    name: string
    logo: string
}

export const getResolutionForName = async (type: string, name: string): Promise<ILinkResolution> => {
    switch (type) {
        case "alliance":
            return await getAllianceInfoFromName(name).then(data => {
                return {
                    type: type,
                    id: data.id,
                    name: data.alliance.name,
                    logo: `https://images.evetech.net/alliances/${data.id}/logo?size=64`
                }
            })
        case "character":
            return await getFullCharacterInfoFromName(name).then(data => {
                return {
                    type: type,
                    id: data.id,
                    name: data.character.name,
                    logo: `https://images.evetech.net/characters/${data.id}/portrait?size=64`
                }
            })
        case "corporation":
            return await getCorporationInfoFromName(name).then(data => {
                return {
                    type: type,
                    id: data.id,
                    name: data.corporation.name,
                    logo: `https://images.evetech.net/corporation/${data.id}/logo?size=64`
                }
            })
    }
    return Promise.reject("invalid type")
}