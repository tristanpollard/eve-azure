import esi from 'node-esi';
import { Response_get_corporations_corporation_id_200 } from '../esi-types';
import { getId } from './search'
import { IAlliance, getAlliance } from './alliance'

export interface ICorporation {
    id: number
    corporation: Response_get_corporations_corporation_id_200,
    alliance?: IAlliance
}

export const getCorporationInfoFromName = async (name: string): Promise<ICorporation> => {
    const id = await getId(name, "corporation")
    if (!id) {
        return Promise.reject("corporation not found")
    }
    return getCorporation(id)
}

export const getCorporation = (corporationId: number): Promise<ICorporation>  => {
    return esi('corporations/' + corporationId)
    .then(data => {
        const corporationInfo: ICorporation = {
            id: corporationId,
            corporation: data.data
        }
        return corporationInfo;
    });
};

export const getFullCorporation = async (corporationId: number) : Promise<ICorporation> => {
    const corporation = await getCorporation(corporationId)
    const allianceId = corporation?.corporation.alliance_id
    const allianceInfo = allianceId ? await getAlliance(allianceId) : undefined
    return {
        id: corporationId,
        corporation: corporation.corporation,
        alliance: allianceInfo
    }
}