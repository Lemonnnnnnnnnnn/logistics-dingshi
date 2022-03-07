export default {
  'GET /v1/goods': (req, res) => {
    const count = 10
    const goods = new Array(count).fill(0).map((v, index) => ({
      "goodsId": `${index + 1}`,
      "organizationId": index + 1,
      "goodsName": `利森水泥PO42.5(散装)_${index + 1}`,
      "categoryId": 7,
      "materialQuality": "adsa",
      "batchNo": "19230624",
      "remarks": "",
      "is_effect": 1,
      "createTime": "2019-01-15T15:16:24",
      "updateTime": "2019-01-15T15:16:24"
    }))
    res.json({
      count,
      items: goods
    })
  },
  'GET /v1/dictionaries':(req, res)=>{
    res.json({
      "count":20,       // 总数
      "items":[
        {
          "dictionaryId":1,
          "dictionaryType":"单位",
          "dictionaryCode":"metre",
          "dictionaryName":"米"
        }, {
          "dictionaryId":2,
          "dictionaryType":"单位",
          "dictionaryCode":"ton",
          "dictionaryName":"吨"
        }, {
          "dictionaryId":3,
          "dictionaryType":"单位",
          "dictionaryCode":"square",
          "dictionaryName":"平方"
        }
      ]
    })
  }
}
