import React, { Component } from 'react';
import moment from 'moment';
import { Badge, Button } from 'antd';
import { connect } from 'dva';
import messageModel from '@/models/message';
import TableContainer from '@/components/Table/TableContainer';
import { MESSAGE_STATUS } from '@/constants/project/project';
import { translatePageType, pick } from '@/utils/utils';
import Table from '@/components/Table/Table';
import { readAllMessage } from '@/services/apiService';

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

const unknownType = '未知类型消息，请联系管理员';

function mapStateToProps (state) {
  return {
    messageList:pick(state.message, ['items', 'count']),
  };
}

@connect(mapStateToProps,
  (dispatch)=>(
    {
      getMessage: (payload)=>dispatch({ type: 'message/getMessage', payload }),
      changeNoticeReadState: ()=> dispatch({ type: 'global/changeNoticeReadState' }),
    }
  )
)
@TableContainer()
export default class MessageList extends Component{

  state = {
    current:1,
    pageSize:10
  }

  tableSchema = {
    columns: [
      {
        title: '消息内容',
        dataIndex: 'messageContent',
        render: (text, record) => {
          const { messageStatus, messageContent, isRead } = record;
          const word = itemConfig[messageStatus]?.text || unknownType;
          return (
            <>
              <Badge dot={isRead===0} />
              <div style={{ display:'inline-block', marginLeft:'6px', color:'#000', fontSize:'14px', fontWeight:'bold' }}>{word}</div>
              <div>{messageContent}</div>
            </>
          );
        }
      },
      {
        title: '时间',
        dataIndex: 'createTime',
        width:'150px',
        render: time => moment(time).format('YYYY-MM-DD HH:mm:ss')
      }
    ],
  }

  componentDidMount (){
    this.props.getMessage({ limit:10, offset:0 });
  }

  onChange = (pagination) => {
    const { offset, limit, current } = translatePageType(pagination);
    this.setState({
      current,
      pageSize: limit
    });
    const newFilter = this.props.setFilter({ offset, limit });
    this.props.getMessage({ ...newFilter });
  }

  changeAllReadState = ()=>{
    readAllMessage()
      .then(() => {
        this.props.changeNoticeReadState;
      });
  }

  render (){
    const { current, pageSize } = this.state;
    const { messageList } =this.props;
    return (
      <>
        <div style={{ textAlign:"right" }}>
          <Button onClick={this.changeAllReadState} type='primary'>全部已读</Button>
        </div>
        <Table
          rowKey="messageId"
          dataSource={messageList}
          schema={this.tableSchema}
          onChange={this.onChange}
          pagination={{ current, pageSize }}
        />
      </>
    );
  }
}
