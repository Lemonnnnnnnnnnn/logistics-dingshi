export default {
  'GET /v1/goodsCategories': (req, res) => {
    res.json({
      "categoryItems": [
        {
          "categoryId": 1,                   // 类目id
          "categoryName": "一级1",           // 类目名称
          "parentId": 0,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 2,                   // 类目id
          "categoryName": "一级2",           // 类目名称
          "parentId": 0,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 3,                   // 类目id
          "categoryName": "一级3",           // 类目名称
          "parentId": 0,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 4,                   // 类目id
          "categoryName": "二级1",           // 类目名称
          "parentId": 1,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 5,                   // 类目id
          "categoryName": "二级2",           // 类目名称
          "parentId": 1,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 6,                   // 类目id
          "categoryName": "二级3",           // 类目名称
          "parentId": 1,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 7,                   // 类目id
          "categoryName": "三级1",           // 类目名称
          "parentId": 5,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        },
        {
          "categoryId": 8,                   // 类目id
          "categoryName": "三级2",           // 类目名称
          "parentId": 5,                       // 上一级id
          "remarks": "",
          "is_effect": 1,
          "createTime": "2019-01-15T15:16:24",
          "updateTime": "2019-01-15T15:16:24"
        }
      ]
    })
  }
}
