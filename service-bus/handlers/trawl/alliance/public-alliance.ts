import Alliance from '../../../../shared/models/alliance'
import { getAlliance } from '../../../../shared/api/public/alliance'
import { IServiceBusActions } from '../../../types'

export const trawl = async (allianceId: number): Promise<IServiceBusActions> => {
    const info = await getAlliance(allianceId)
    const insertData = {
        ...info.alliance,
        date_founded: new Date(info.alliance.date_founded)
    }

    await Alliance.query()
    .patchAndFetchById(allianceId, insertData)
    .then(data => {
        if (!data) {
            return Alliance.query().insertAndFetch({ ...insertData, id: allianceId })
        }
        return data
    })

    return {
        
    }
}
