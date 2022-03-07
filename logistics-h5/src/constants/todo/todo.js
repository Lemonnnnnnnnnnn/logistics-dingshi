import transportIcon from '@/assets/transport.svg'
import contranctIcon from '@/assets/contract.svg'
import subAccountIcon from '@/assets/add_subAccount.png'

export default {
  1:{
    after: '合同待审批',
    url:`/weapp/personalCenter/contractList/contractDetail?projectId=`,
    icon:contranctIcon
  },
  2:{
    after: '运单待处理',
    url: `/Weapp/transportDetail?transportId=`,
    icon:transportIcon
  },
  3:{
    after: '子账号添加申请',
    url: `/Weapp/personalCenter/SubAccountList?`,
    icon:subAccountIcon
  }
}
