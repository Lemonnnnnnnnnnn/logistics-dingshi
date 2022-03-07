import React, { Component } from 'react';
import { List, Badge } from 'antd';

interface IProps {
  toggleMessageStatus: (params: string) => void;
  loading: boolean; //消息加载
  messageList: ListItem<obj<any>>; // 消息列表
}

const MESSAGE_STATUS = {
  PREBOOK_UNAUDITED: 1, // 预约单待确定
  PREBOOK_REFUSE: 2, // 预约单拒绝
  PREBOOK_UNCOMPLETED: 3, // 预约单调度中
  PREBOOK_COMPLETE: 4, // 预约单调度完成
  TRANSPORT_UNTREATED: 5, // 运单未接单
  TRANSPORT_REFUSE: 6, // 司机拒绝运单
  TRANSPORT_ACCEPT: 7, // 运单已接单
  TRANSPORT_SIGNED: 8, // 运单已签收
  TRANSPORT_SHIPMENT_REFUSE: 9, // 承运已拒绝运单
  TRANSPORT_SHIPMENT_AUDITED: 10, // 承运已审核运单
  TRANSPORT_CONSIGNMENT_REFUSE: 11, // 托运已拒绝运单
  TRANSPORT_COMPLETE: 12, // 运单已完成
  TRANSPORT_EXECPTION: 13, // 运单异常
  GOODSPLANS_CONSIGNMENT_UNTREATED: 14, // 14待托运方确认(要货计划单)
  GOODSPLANS_CUSTOMER_CANCEL: 15, // 15客户已取消(要货计划单)
  GOODSPLANS_CONSIGNMENT_REFUSE: 16, // 16托运方已拒绝(要货计划单)
  GOODSPLANS_COMPLETED: 17, // 17已完成(要货计划单)
  GOODSPLANS_FINISH: 18, // 18已结束(要货计划单)
  GOODSPLANS_GOINGON: 19, // 19进行中(要货计划单)
  TRANSPORT_CUSTOMER_CONFIRM: 20, // 20客户已确认收货(运单)
  TRANSPORT_CUSTOMER_REFUSE: 21, // 21客户已拒绝(运单)
  TRANSPORT_CUSTOMER_UNAUDITED: 22, // 22待客户确认收货(运单)
  CONTRACT_CUSTOMER_UNAUDITED: 23, // 23待客户审核(合同)
  CONTRACT_CUSTOMER_REJECT: 24, // 24客户审核不通过(合同)
  CONTRACT_CUSTOMER_AUDITED: 25, // 25客户审核通过(合同)
  CONTRACT_PLAT_UNAUDITED: 26, // 26平台待审(合同)
  CONTRACT_SHIPMENT_UNAUDITED: 27, // 27承运待审(合同)
  CONTRACT_PLAT_REFUSE: 28, // 28平台拒绝(合同)
  APPLY_ADD_CONTRACT: 29, // 子账号申请加入(合同)
  PASS_APPLY_CONTRACT: 30, // 子账号加入申请通过(合同)
  REFUSE_APPLY_CONTRACT: 31, // 子账号加入申请不通过(合同)
};

const {
  PREBOOK_UNAUDITED,
  PREBOOK_REFUSE,
  PREBOOK_UNCOMPLETED,
  PREBOOK_COMPLETE,
  TRANSPORT_UNTREATED,
  TRANSPORT_REFUSE,
  TRANSPORT_ACCEPT,
  TRANSPORT_SIGNED,
  TRANSPORT_SHIPMENT_REFUSE,
  TRANSPORT_SHIPMENT_AUDITED,
  TRANSPORT_CONSIGNMENT_REFUSE,
  TRANSPORT_COMPLETE,
  TRANSPORT_EXECPTION,
  GOODSPLANS_CONSIGNMENT_UNTREATED,
  GOODSPLANS_CUSTOMER_CANCEL,
  GOODSPLANS_CONSIGNMENT_REFUSE,
  GOODSPLANS_COMPLETED,
  GOODSPLANS_FINISH,
  GOODSPLANS_GOINGON,
  TRANSPORT_CUSTOMER_CONFIRM,
  TRANSPORT_CUSTOMER_REFUSE,
  TRANSPORT_CUSTOMER_UNAUDITED,
  CONTRACT_CUSTOMER_UNAUDITED,
  CONTRACT_CUSTOMER_REJECT,
  CONTRACT_CUSTOMER_AUDITED,
  CONTRACT_PLAT_UNAUDITED,
  CONTRACT_SHIPMENT_UNAUDITED,
  CONTRACT_PLAT_REFUSE,
  APPLY_ADD_CONTRACT,
  PASS_APPLY_CONTRACT,
  REFUSE_APPLY_CONTRACT,
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
};

const unknownType = '未知类型消息，请联系管理员';

export default class MessageContent extends Component<IProps> {
  render() {
    const {
      messageList: { items = [], count },
      toggleMessageStatus,
    } = this.props;
    return (
      <div className="message-list-box">
        <List
          header={
            <div
              style={{
                textAlign: 'center',
                fontSize: '18px',
                lineHeight: '30px',
              }}
            >{`消息（${
              items.filter((item) => item.isRead === 0).length
            }）`}</div>
          }
          itemLayout="horizontal"
          dataSource={items || []}
          renderItem={(item) => {
            const word = itemConfig[item.messageStatus]?.text || unknownType;
            return (
              <div
                style={{
                  borderBottom: '1px solid rgba(217, 217, 217, 1)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  toggleMessageStatus(item.messageId);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '15px' }}>
                    <Badge dot={item.isRead === 0} />
                  </div>
                  <div
                    style={{
                      color: 'rgba(0, 0, 0, 0.647058823529412)',
                      fontSize: '14px',
                      lineHeight: '30px',
                    }}
                  >
                    {word}
                  </div>
                </div>
                <div style={{ padding: '5px 10px', lineHeight: '25px' }}>
                  <div style={{ color: 'rgba(0, 0, 0, 0.447058823529412)' }}>
                    {item.messageContent}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    );
  }
}
