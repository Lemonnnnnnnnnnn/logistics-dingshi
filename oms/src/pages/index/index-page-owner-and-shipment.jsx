import React from 'react';
import { Card, Row, Col, Menu, Alert } from 'antd';
import Media from 'react-media';
import { getconTodayAndYesIn, getConTranStatusTotal, getRroRecivingList } from '../../services/apiService';
import { CARGOES } from '../../constants/organization/organization-type';
import { isEmpty } from '../../utils/utils';
import OrderAddInfoList from './components/order-add-info-list';
import PreBookingDonut from './components/pre-booking-donut';
import TransportDonut from './components/transport-donut';
import IndexMap from './components/index-map';
import "./index.css";

const { SubMenu } = Menu;

class IndexPageOwnerAndShipment extends React.Component {
  state = {
    addInfoData: [],
    orderInfoData: [],
    recivingList: [], // 卸货点展示数据
    ready: false,
    selectKey: [], // 选中的Key值
    openKeys: [], // 当前展开的Key
    showMarkerList: [], // 标中的点
    isIE: false
  }

  constructor (props) {
    super(props);
    this.organizationType = props.organizationType;
  }

  componentDidMount () {
    if (this.organizationType === CARGOES){ // 如果是货权
      getRroRecivingList({ offset:0, limit:10, isCount: false, projectStatus:1 })
        .then(({ items: recivingList }) => {
          this.setState({
            recivingList,
            ready: true
          });
        });
    } else {
      Promise.all([getconTodayAndYesIn(), getConTranStatusTotal(), getRroRecivingList({ offset:0, limit:10, isCount: false, projectStatus:1 })])
        .then(([addInfoData, orderInfoData, { items: recivingList }]) => {
          const openKeys = [];
          let showMarkerList = [];
          if (recivingList&&recivingList.length) { // 如果存在项目数据
            const [firstData = {}] = recivingList;
            openKeys.push(firstData.projectId ? `${firstData.projectId}` : '');
            showMarkerList = firstData.receivingRespList.map(item => ({
              receivingId: item.receivingId || '',
              isAvailable: firstData.isAvailable || '',
              projectName: firstData.projectName || '',
              receivingName: item.receivingName || '',
              preBookingTotal: item.preBookingTotal || '',
              position: {
                longitude: +(item.receivingLongitude?.toFixed(2)||0),
                latitude: +(item.receivingLatitude?.toFixed(2)||0)
              }
            }));
          }
          this.setState({
            openKeys,
            addInfoData,
            orderInfoData,
            recivingList,
            showMarkerList,
            ready: true,
            isIE: this.isBrowserVersionLowerThanIE10()
          });
        });
    }
  }

  isBrowserVersionLowerThanIE10 = () => {
    let explorer= window.navigator.userAgent;
    explorer = explorer.toLowerCase();
    // ie
    if (explorer.indexOf('msie') >= 0) {
      const ver = parseInt(explorer.match(/msie ([\d.]+)/)[1] || '');
      if (ver < 11){
        return true;
      }
    }
    return false;
  }

  renderBrowserUpgradeTip = () => (
    <Alert
      message="IE10及以下浏览器版本兼容性较差,推荐使用Chrome浏览器"
      banner
      closable
    />
  )

  renderOrderStatistics = () => {
    const { preToBeDetermined, preDispatchIng, preRefuse, preOver, tranUnRece, tranAccept,
      tranToBePick, tranportIng, tranSign, tranTobeAudit, tranAbnormal, tranReject } = this.state.orderInfoData;
    const reservationOrderData = {
      title: '进行中的预约单',
      data: [
        {
          item: '待确定',
          count: preToBeDetermined
        },
        {
          item: '调度中',
          count: preDispatchIng
        },
        {
          item: '已拒绝',
          count: preRefuse
        },
        {
          item: '调度完成',
          count: preOver
        }
      ]
    };
    const onGoingOrderData = {
      title: '进行中的运单',
      data: [
        {
          item: '未接单',
          count: tranUnRece
        },
        {
          item: '已接单',
          count: tranAccept
        },
        {
          item: '待提货',
          count: tranToBePick
        },
        {
          item: '运输中',
          count: tranportIng
        },
        {
          item: '已签收',
          count: tranSign
        },
        {
          item: '待审核',
          count: tranTobeAudit
        },
        {
          item: '运单异常',
          count: tranAbnormal
        },
        {
          item: '被拒绝',
          count: tranReject
        }
      ]
    };
    const bigScreenStyle = {
      PreBookingDonut: { width:'50%', display:'inline-block' },
      TransportDonut: { width:'50%', display:'inline-block' }
    };
    const smallScreenStyle = {
      PreBookingDonut: { width:'100%' },
      TransportDonut:{ width:'100%' }
    };
    const orderStatistics = (style)=>(
      <Card title="单据信息" bordered={false}>
        <div style={style.PreBookingDonut}>
          <PreBookingDonut {...reservationOrderData} organizationType={this.organizationType} />
        </div>
        <div style={style.TransportDonut}>
          <TransportDonut {...onGoingOrderData} organizationType={this.organizationType} />
        </div>
      </Card>
    );
    if (this.state.isIe){
      return (
        <Card title="单据信息" bordered={false}>
          <h1 style={{ padding:'120px 0', textAlign: 'center', fontSize: '30px', color: '#aaa' }}>该图表显示不支持IE10及以下版本</h1>
        </Card>
      );
    }
    return (
      <Media query="(max-width: 1400px)">
        {matches => matches ?
          orderStatistics(smallScreenStyle)
          :
          orderStatistics(bigScreenStyle)
        }
      </Media>
    );
  }

  /**
   * 组装全部项目数据
   * @memberof IndexPageOwnerAndShipment
   */
  fetchSubMenu = () => {
    const { recivingList } = this.state;
    if (isEmpty(recivingList)) {
      return <span style={{ lineHeight:'1.5em' }}>暂无数据</span>;
    }
    return (recivingList||[]).map(item => (
      <SubMenu
        key={item.projectId}
        title={
          <span>
            <span style={{ fontSize: '14px', paddingRight: '5px', color: item.isAvailable ? '#00A854': '#EA5D2A' }}>{item.isAvailable? '启用': '禁用'}</span>
            <span style={{ fontSize: '14px', color: '#0D0D0D' }}>{item.projectName}<span style={{ fontSize: '10px', color: '#999' }}>（{(item.receivingRespList||[]).length}个卸货点）</span></span>
          </span>
        }
      >
        {(item.receivingRespList||[]).map(itm => (
          <Menu.Item key={`${item.projectId}-${itm.receivingId}`}>{itm.receivingName} （{itm.preBookingTotal}个预约单）</Menu.Item>
        ))}
      </SubMenu>
    ));
  }

  /**
   * 全部项目点击
   * @memberof IndexPageOwnerAndShipment
   */
  handleMenuClick = ({ key }) => {
    this.setState({ selectKey: [key] });
  }

  onOpenMenuChange = key => {
    const { recivingList, openKeys } = this.state;
    if (key.length > 1) { // 如果展开的Key值大于1，去掉首部展开Key值
      key.shift();
    } else if (!key.length) { // 如果选中当前，不进行关闭，默认还是展开当前显示的Key
      key = openKeys;
    }
    let showMarkerList = [];
    recivingList.some(item => {
      if (item.projectId === +key[0]) {
        showMarkerList = item.receivingRespList.map(itm => {
          const { isAvailable, projectName } = item;
          const { preBookingTotal = 0, receivingName = '', receivingLatitude,
            receivingLongitude, receivingId } = itm;
          return {
            receivingId,
            isAvailable,
            projectName,
            receivingName,
            preBookingTotal,
            position: {
              longitude: +receivingLongitude.toFixed(2),
              latitude: +receivingLatitude.toFixed(2)
            },
          };
        });
        return true;
      }
      return false;
    });
    this.setState({ openKeys: key, selectKey: [], showMarkerList });
  }

  render () {
    const { ready, addInfoData, selectKey, openKeys, showMarkerList, isIE } = this.state;
    return (
      <>
        { isIE && this.renderBrowserUpgradeTip() }
        {this.organizationType !== CARGOES && ready && <OrderAddInfoList {...addInfoData} organizationType={this.organizationType} />}
        <div style={{ padding: '20px' }}>
          {this.organizationType !== CARGOES && ready && this.renderOrderStatistics(isIE)}
          <Card title='项目信息' bordered={false}>
            <Row>
              <Col span={16}>
                <IndexMap showMarkerList={showMarkerList} selectKey={selectKey[0]} />
              </Col>
              <Col span={8}>
                <Card title='全部项目' bordered={false}>
                  <div style={{ height: '444px', overflowY: 'auto' }}>
                    <Menu
                      mode='inline'
                      openKeys={openKeys}
                      selectedKeys={selectKey}
                      onClick={this.handleMenuClick}
                      onOpenChange={this.onOpenMenuChange}
                    >
                      {this.fetchSubMenu()}
                    </Menu>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </>
    );
  }
}
export default IndexPageOwnerAndShipment;
