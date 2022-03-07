import { getDictionaries } from './apiService'

let Dictionaries = []
let hasLoad = false

export const DICTIONARY_TYPE = {
  CAR_TYPE: 'car_type',
  PACKAGING_METHOD: 'packaging_method',
  GOOD_UNIT: 'goods_unit',
  EXCEPTION_REASON: 'exception_reason'
}

export default function getDictionaryByType (type) {
  const _getDictionaries = () => hasLoad
    ? Promise.resolve({ count: Dictionaries.length, items: Dictionaries })
    : getDictionaries({ offset: 0, limit: 1000 })
      .then((data = { items: [] }) => {
        Dictionaries = data.items
        hasLoad = true
        return data
      })

  return _getDictionaries()
    .then(data => {
      const items = data.items.filter(item => type ? item.dictionaryType === type : true)
      return { count: items.length, items }
    })
}
