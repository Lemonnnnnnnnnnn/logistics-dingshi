import { formatModel } from '@/tools/utils'
import bindSource from '@/tools/bindSource'
import getDictionaryByType from '@/services/dictionaryService'

export default formatModel(bindSource({
  name: 'dictionaries',
  getDictionaries: getDictionaryByType
})({ namespace: 'dictionaries' }))
