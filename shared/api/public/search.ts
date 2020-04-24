import esi from 'node-esi';
import NotFoundError from '../../errors/NotFoundError'

export const getId = (searchQuery: string, category: string): Promise<undefined | number> => {
    return esi('search', { params: {categories: category, strict: true, search: searchQuery } })
    .then(data => {
        const ids = data.data[category]
        if (ids) {
            return ids.shift();
        }
        throw new NotFoundError
    })
}