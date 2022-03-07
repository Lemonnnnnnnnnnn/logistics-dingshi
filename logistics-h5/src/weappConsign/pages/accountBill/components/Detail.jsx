import React from 'react'
import { connect } from 'dva'
import moment from 'moment'
import CSSModules from 'react-css-modules'
import model from '@/models/transportAccount'
import transportsModel from '@/models/transports'
import styles from './detail.less'
import ListContainer from '@/mobile/page/component/ListContainer'
import transportsItem from '../../workbench/component/transportItem'
import { getAuthority } from '@/utils/authority'
import auth from '@/constants/authCodes'

const { actions: { detailTransportAccount } } = model

const { actions: { getTransports } } = transportsModel

function mapStateToProps (state) {
  return {
    detail: state.transportAccount.entity,
  }
}

const Lists = ListContainer(transportsItem)

@connect(mapStateToProps, { detailTransportAccount, getTransports })
@CSSModules(styles, { allowMultiple: true })
export default class Detail extends React.Component{

  state = {
    ready:false
  }

  componentDidMount () {
    const { location: { query: { accountTransportId } } } = this.props
    this.props.detailTransportAccount({ accountTransportId })
      .then(() => {
        this.setState({
          ready:true
        })
      })
  }

  renderList = () => {
    const { ACCOUNT } = auth
    const ownedPermissions = getAuthority()
    const spacialAuthes = [ACCOUNT]  // 能够查看全部项目预约单运单的权限
    const check = spacialAuthes.some(auth => ownedPermissions.indexOf(auth) > -1)
    const props = {
      action: this.props.getTransports,
      dataCallBack: this.dataCallBack,
      primaryKey: 'transportId',
      params: {
        accountTransportNo: this.props.detail.accountTransportNo,
        isPermissonSelectAll:check||undefined
      },
      style:{
        display: 'block',
        height:'calc(100vh - 90px)',
        width: '100%',
        padding: '15px 0'
      },
    }
    return <Lists ref={this.listRef} {...props} />
  }

  render () {
    const { detail } = this.props
    const { ready } = this.state
    return (
      <>
        {
          ready
          &&
          <>
            <header styleName='header'>
              <h3 styleName='title'>
                <span>运单数{detail.transportNumber}</span>
                <span>-￥{detail.receivables.toFixed(2)._toFixed(2)}</span>
              </h3>
              <p styleName='time'>{moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
            </header>
            {this.renderList()}
          </>
        }
      </>
    )
  }
}
