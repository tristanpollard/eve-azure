import esi from 'node-esi';
import { Response_get_alliances_alliance_id_200 } from '../esi-types';
import { getId } from './search'

export interface IAlliance {
    id: number
    alliance: Response_get_alliances_alliance_id_200
}

export const getAllianceInfoFromName = async (name: string): Promise<IAlliance> => {
    const id = await getId(name, "alliance")
    if (!id) {
        return Promise.reject("alliance not found")
    }
    return getAlliance(id)
}

export const getAlliance = (allianceId: number): Promise<IAlliance> => {
    return esi('alliances/' + allianceId)
    .then(data => {
        const fullAlliance: IAlliance = {
            id: allianceId,
            alliance: data.data
        }
        return fullAlliance
    });
};