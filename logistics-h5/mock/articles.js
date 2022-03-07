export default {
  'GET /v1/articles': (req, res) => {
    const { offset, limit } = req.query
    const count = 20
    const items = new Array(count).fill(true).map((v, index) => ({
      articleId: index,
      title: `article_${index}`,
      author: `author_${index}`,
      create_time: new Date(),
      state: Math.floor(index / 3)
    })).slice(offset, (offset + limit))

    res.json({
      count,
      items
    })
  }
}
