import React, { PureComponent } from 'react';
import { Spin, Menu, Icon, Avatar, Badge, Row } from 'antd';
import moment from 'moment';
import { NoticeIcon } from 'ant-design-pro';
import router from 'umi/router';
import { MESSAGE_STATUS } from '@/constants/project/project';
import { getRoleText } from '@/services/user';
import { readMessage, readAllMessage } from '@/services/apiService';
import HeaderDropdown from '../HeaderDropdown/index';
import styles from './index.less';

const {
  PREBOOK_UNAUDITED, PREBOOK_REFUSE, PREBOOK_UNCOMPLETED, PREBOOK_COMPLETE, TRANSPORT_UNTREATED, TRANSPORT_REFUSE, TRANSPORT_ACCEPT, TRANSPORT_SIGNED,
  TRANSPORT_SHIPMENT_REFUSE, TRANSPORT_SHIPMENT_AUDITED, TRANSPORT_CONSIGNMENT_REFUSE, TRANSPORT_COMPLETE, TRANSPORT_EXECPTION, GOODSPLANS_CONSIGNMENT_UNTREATED,
  GOODSPLANS_CUSTOMER_CANCEL, GOODSPLANS_CONSIGNMENT_REFUSE, GOODSPLANS_COMPLETED, GOODSPLANS_FINISH, GOODSPLANS_GOINGON, TRANSPORT_CUSTOMER_CONFIRM, TRANSPORT_CUSTOMER_REFUSE,
  TRANSPORT_CUSTOMER_UNAUDITED, CONTRACT_CUSTOMER_UNAUDITED, CONTRACT_CUSTOMER_REJECT, CONTRACT_CUSTOMER_AUDITED, CONTRACT_PLAT_UNAUDITED, CONTRACT_SHIPMENT_UNAUDITED,
  CONTRACT_PLAT_REFUSE, APPLY_ADD_CONTRACT, PASS_APPLY_CONTRACT, REFUSE_APPLY_CONTRACT, TRANSFER_BILL_DELIVERY
} = MESSAGE_STATUS;

const itemConfig = {
  [PREBOOK_UNAUDITED]: { text: '待确定' },
  [PREBOOK_REFUSE]: { text: '已拒绝' },
  [PREBOOK_UNCOMPLETED]: { text: '调度中' },
  [PREBOOK_COMPLETE]: { text: '调度完成' },
  [TRANSPORT_UNTREATED]: { text: '未接单' },
  [TRANSPORT_REFUSE]: { text: '司机拒绝运单' },
  [TRANSPORT_ACCEPT]: { text: '司机已接单' },
  [TRANSPORT_SIGNED]: { text: '已签收' },
  [TRANSPORT_SHIPMENT_REFUSE]: { text: '承运已拒绝运单' },
  [TRANSPORT_SHIPMENT_AUDITED]: { text: '承运已审核运单' },
  [TRANSPORT_CONSIGNMENT_REFUSE]: { text: '托运已拒绝运单' },
  [TRANSPORT_COMPLETE]: { text: '运单已完成' },
  [TRANSPORT_EXECPTION]: { text: '运单异常' },
  [GOODSPLANS_CONSIGNMENT_UNTREATED]: { text: '要货计划单托运待确定' },
  [GOODSPLANS_CUSTOMER_CANCEL]: { text: '要货计划单客户已取消' },
  [GOODSPLANS_CONSIGNMENT_REFUSE]: { text: '要货计划单托运已拒绝' },
  [GOODSPLANS_COMPLETED]: { text: '要货计划单托运已完成' },
  [GOODSPLANS_FINISH]: { text: '要货计划单已结束' },
  [GOODSPLANS_GOINGON]: { text: '要货计划单进行中' },
  [TRANSPORT_CUSTOMER_CONFIRM]: { text: '运单客户已确认收货' },
  [TRANSPORT_CUSTOMER_REFUSE]: { text: '运单客户已拒绝' },
  [TRANSPORT_CUSTOMER_UNAUDITED]: { text: '运单待客户确认收货' },
  [CONTRACT_CUSTOMER_UNAUDITED]: { text: '合同待客户审核' },
  [CONTRACT_CUSTOMER_REJECT]: { text: '合同客户审核不通过' },
  [CONTRACT_CUSTOMER_AUDITED]: { text: '合同客户审核通过' },
  [CONTRACT_PLAT_UNAUDITED]: { text: '合同待平审核' },
  [CONTRACT_SHIPMENT_UNAUDITED]: { text: '合同承运待审核' },
  [CONTRACT_PLAT_REFUSE]: { text: '合同平台拒绝' },
  [APPLY_ADD_CONTRACT]: { text: '子账号申请加入提醒' },
  [PASS_APPLY_CONTRACT]: { text: '子账号申请加入提醒' },
  [REFUSE_APPLY_CONTRACT]: { text: '子账号申请加入提醒' },
  [TRANSFER_BILL_DELIVERY] : { text : '实体单据转交' }
};

export default class GlobalHeaderRight extends PureComponent {
  getNoticeData () {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      const config = itemConfig[newNotice.messageStatus]||{ text: '状态暂未定义' };
      newNotice.datetime = moment(notice.createTime).format('YYYY-MM-DD HH:mm:ss');
      newNotice.key = newNotice.messageId;
      newNotice.title = config.text;
      newNotice.description = (<div title={newNotice.messageContent} className='singleRow'>{newNotice.messageContent}</div>);
      newNotice.avatar = newNotice.isRead === 1
        ?(
          <div style={{ display:'inline-block', width:'6px' }} />
        )
        :(
          <Badge style={{ top:'-15px' }} dot />
        );
      newNotice.clickClose = true;
      return newNotice;
    });
    return { message: newNotices };
  }

  getUnreadData = noticeData => {
    const unreadMsg = {};
    Object.entries(noticeData).forEach(([key, value]) => {
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => item.isRead === 0).length;
      }
    });
    return unreadMsg;
  };

  changeReadState = clickedItem => {
    const { key } = clickedItem;
    const { dispatch } = this.props;
    readMessage({ messageId : key, isRead: 1 })
      .then(()=>{
        dispatch({
          type: 'global/changeNoticeReadState',
          payload: key,
        });
      });
  };

  changeAllReadState = () =>{
    const { dispatch } = this.props;
    readAllMessage()
      .then(() => {
        dispatch({
          type: 'global/changeNoticeReadState'
        });
      });
  }

  viewAllMessage = () =>{
    router.push('/user-manage/message-center');
  }

  render () {
    const {
      currentUser,
      // fetchingNotices,
      onNoticeVisibleChange,
      onMenuClick,
      // onNoticeClear,
      theme,
      route,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        {/* <Menu.Item key="userCenter">
          <Icon type="user" />
          <FormattedMessage id="menu.account.center" defaultMessage="account center" />
        </Menu.Item> */}
        {/* <Menu.Item key="userinfo">
          <Icon type="setting" />
          <FormattedMessage id="menu.account.settings" defaultMessage="account settings" />
        </Menu.Item> */}
        <Menu.Item key="logout">
          <Icon type="logout" />
          <span>退出登录</span>
        </Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();
    const unreadMsg = this.getUnreadData(noticeData);
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <Row type='flex' align='middle' className={className}>
        <div>
          <NoticeIcon
            className={styles.action}
            count={unreadMsg.message}
            onItemClick={(item, tabProps) => {
              this.changeReadState(item);
            }}
            onClear={this.changeAllReadState}
            onViewMore={this.viewAllMessage}
            locale={{
              emptyText: '暂无消息', clear: '全部设为已读', viewMore: '查看所有消息'
            }}
            onPopupVisibleChange={onNoticeVisibleChange}
            clearClose
          >
            <NoticeIcon.Tab
              list={noticeData.message}
              showViewMore
              // showClear={false}
              // viewMoreText='111'
              title='消息'
              emptyText='暂无消息'
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            />
          </NoticeIcon>
        </div>
        {currentUser.nickName ? (
          <HeaderDropdown overlay={menu}>
            <div className={`${styles.action} ${styles.account}`}>
              <Row type='flex'>
                <Avatar
                  size="small"
                  className={styles.avatar}
                  src={currentUser.avatar}
                  alt="avatar"
                />
                <Row type='flex' align='middle' style={{ marginRight : '0.5rem' }}>
                  <div>

                    <div className={styles.name}>{currentUser.accountType === 1 ? currentUser.abbreviationName : currentUser.nickName} ({getRoleText()})</div>
                    { currentUser.accountType !== 1 && <div style={{ textAlign: "center" }}>{currentUser.abbreviationName}</div>}
                  </div>
                </Row>
              </Row>
            </div>
          </HeaderDropdown>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}
      </Row>
    );
  }
}
