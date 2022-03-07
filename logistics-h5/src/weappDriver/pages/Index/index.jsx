import React, { Component } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Toast, Modal, Button } from 'antd-mobile'
import { pick, xmlStr2json, flattenDeep } from '@/utils/utils'
import model from '@/models/transports'
import { getBanner, getIncomeDetailsTotal } from '@/services/apiService'
import ListContainer from '@/mobile/page/component/ListContainer'
import TransportItem from './component/transportItem'
import styles from './index.less'

const { actions: { getTransports } } = model

function mapStateToProps (state) {
  return {
    transports: pick(state.mobileTransport, ['items', 'count']),
  }
}

const config = {
  resign: {
    status: [8, 10, 22],
    titleText: '重新签收',
    key: '_1_',
  },
  execute: {
    status: [5, 6, 7, 8, 21],
    titleText: '运输中',
    key: '_2_',
  },
  accept: {
    status: [2, 18],
    titleText: '待执行',
    key: '_3_',
  },
  process: {
    status: [1, 17],
    titleText: '待接单',
    key: '_4_',
  },
  all: {
    status: [],
    titleText: '历史运单',
    key: '_5_',
  },
}

const List = ListContainer(TransportItem)


@connect(mapStateToProps, { getTransports })
class Index extends Component {

  state = {
    count: 0,
    total: 0,
    today: 0,
    visible: false,
    modalObj: {
      title: '',
      content: '',
    },
  }

  constructor (props) {
    super(props)
    this.resetConfig()
  }

  componentDidMount () {
    Promise.all([
      getIncomeDetailsTotal({
        createDateStart: moment().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      }),
      getIncomeDetailsTotal(),
    ])
      .then(([today, total]) => {
        this.setState({
          today,
          total,
        })
      })
    if (!localStorage.getItem('driver-showHomeModal') || localStorage.getItem('driver-showHomeModal') !== '0') {
      getBanner('login-tip-driver').then((response) => {
        const obj = xmlStr2json(response).rss ? xmlStr2json(response).rss.channel : { item: [] }
        const article = flattenDeep([obj.item]);
        const latestItem = article.find(item => flattenDeep([item.category]).some(_item => _item.indexOf('visible') !== -1));

        if (latestItem) {
          this.setState({ visible: true })
          localStorage.setItem('driver-showHomeModal', '1')
          this.setState({ modalObj: { title: latestItem.title, content: latestItem['content:encoded'] } })
        }

      })
    }
  }

  getTransports = (params) => this.props.getTransports(params)


  getTransportCount = ({ count }) => {
    this.setState({
      count,
    })
  }

  resetConfig = () => {
    this.config = config.resign
  }

  refreshIncome = () => {
    Promise.all([
      getIncomeDetailsTotal({
        createDateStart: moment().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
        createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
      }),
      getIncomeDetailsTotal(),
    ])
      .then(([today, total]) => {
        this.setState({
          today,
          total,
        })
      })
  }

  renderTabsContent = () => {
    const props = {
      action: this.getTransports,
      params: { driverOrderBy: true },
      dataCallBack: this.getTransportCount,
      dealWithData: this.dealWithData,
      afterRefresh: this.refreshIncome,
      wingBlank: true,
      style: {
        height: 'calc(100% - 92px)',
        top: '82px',
      },
    }
    return (
      <>
        <List {...props} />
      </>
    )
  }

  dealWithData = data => {
    this.resetConfig()
    const newData = data.reduce((all, pre, index) => {
      const { transportImmediateStatus } = pre
      if (index === 0 && config.resign.status.indexOf(transportImmediateStatus) > -1) {
        return [{ isTitle: true, titleText: this.config.titleText, transportId: this.config.key }, pre]
      }
      if (this.config.key !== '_2_' && this.config.status.indexOf(transportImmediateStatus) < 0 && config.execute.status.indexOf(transportImmediateStatus) > -1) {
        this.config = config.execute
        return [...all, { isTitle: true, titleText: this.config.titleText, transportId: this.config.key }, pre]
      }
      if (this.config.key !== '_3_' && this.config.status.indexOf(transportImmediateStatus) < 0 && config.accept.status.indexOf(transportImmediateStatus) > -1) {
        this.config = config.accept
        return [...all, { isTitle: true, titleText: this.config.titleText, transportId: this.config.key }, pre]
      }
      if (this.config.key !== '_4_' && this.config.status.indexOf(transportImmediateStatus) < 0 && config.process.status.indexOf(transportImmediateStatus) > -1) {
        this.config = config.process
        return [...all, { isTitle: true, titleText: this.config.titleText, transportId: this.config.key }, pre]
      }
      if (this.config.key !== '_5_' && this.config.status.indexOf(transportImmediateStatus) < 0) {
        this.config = config.all
        return [...all, { isTitle: true, titleText: this.config.titleText, transportId: this.config.key }, pre]
      }

      return [...all, pre]
    }, [])
    return newData
  }

  renderIncome = () => {
    const { today, total, count } = this.state
    return (
      <div className={styles.flex_container}>
        <div className={styles.incomeItem}>
          <div className={styles.number_style}>{count}</div>
          <div className={styles.word_style}>运单总数</div>
        </div>
        <div className={styles.incomeItem}>
          <div className={styles.number_style}>{today}</div>
          <div className={styles.word_style}>今日收益</div>
        </div>
        <div className={styles.incomeItem}>
          <div className={styles.number_style}>{total}</div>
          <div className={styles.word_style}>总收益</div>
        </div>
      </div>
    )
  }

  handleOk = () => {
    this.setState({ visible: false })
    localStorage.setItem('driver-showHomeModal', '0')
  }

  render () {
    const { modalObj, visible } = this.state
    return (
      <div className={styles.goodsPlanList}>
        {this.renderIncome()}
        {this.renderTabsContent()}
        <Modal
          // title="系统提示"
          className='modalBox'
          style={{ bottom: '37px', margin: '13px 10px', width: 'calc(100% - 20px)' }}
          visible={visible}
          transparent
        >
          <div style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              textAlign: 'center',
              height: '60px',
              fontWeight: 'bold',
              letterSpacing: '2px',
            }}
            >
              {modalObj.title}
            </h1>
            <p
              style={{ padding: ' 20px', flex: 1, overflowY: 'scroll' }}
              dangerouslySetInnerHTML={{ __html: modalObj.content }}
            />
            <div style={{ textAlign: 'center', height: '60px' }}>
              <Button type='primary' onClick={this.handleOk}>我已知晓</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default Index
