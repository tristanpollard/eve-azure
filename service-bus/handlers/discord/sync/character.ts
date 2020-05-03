import { IServiceBusActions } from "../../../types";
import { getCharacterInfo } from "../../../../shared/api/public/character";

export const handleCharacterSync = async (character: number, guild: string): Promise<IServiceBusActions> => {
    const characterInfo = await getCharacterInfo(character)

    return {
        
    }
}