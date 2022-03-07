export default {
  'GET /v1/formDemo': (req, res) => {
    res.json({
      id: 1,
      title: `formDemo`,
      userName:'formDemo.这是一个用户名',
      author: `jony`,
      realName:'',
      createTime: new Date(1553307182396).getTime(),
      project:[2],
      area: ``,
      phone: null
    })
  },
  'GET /v1/formDemo/selectList': (req, res) => {
    res.json({
      count:3,
      items:[{
        id: 1,
        title: `project 1`,
      }, {
        id: 2,
        title: `project 2`,
      }, {
        id: 3,
        title: `project 3`,
      }]
    })
  },
}
