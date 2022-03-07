import React from 'react'
import router from 'umi/router'
import { connect } from 'dva'

function mapDispatchToProps (dispatch) {
  return {
    getNowUser: () => dispatch({ type: 'user/getNowUser' })
  }
}

@connect(null, mapDispatchToProps)
export default class Intelligence extends React.Component{
  componentDidMount () {
    this.props.getNowUser().then(res => {
      const { auditStatus, perfectStatus } = res
      if (!auditStatus) {
        router.replace('userCheck')
      }
      if (auditStatus === 1 && perfectStatus === 2) {
        router.replace('congratulation')
      }
      if (auditStatus === 1 && (perfectStatus === 3 || perfectStatus === 0)) {
        return router.replace('unComplete')
      }
      if (auditStatus === 1 && perfectStatus === 1) {
        return router.replace('complete')
      }
    })
  }

  render () {
    return false
  }
}