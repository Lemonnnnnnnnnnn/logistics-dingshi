const getAuthorization = (req, res) => {
  const count = 10
  const permissionItems = new Array(count).fill(true).map((v, index) => ({
    permissionId: index + 1,
    roleType: 'platform',
    code: `platform_user_manage_${index + 1}`,
    name: `用户管理_${index + 1}`,
    type: 'menu',
    parent: 1,
    order: 1,
    createTime: '2019-01-15T15:16:24',
    updateTime: '2019-01-15T15:16:24'
  }))

  return res.json({ permissionItems });
}

export default {
  'GET /api/authorizations': getAuthorization,
};
