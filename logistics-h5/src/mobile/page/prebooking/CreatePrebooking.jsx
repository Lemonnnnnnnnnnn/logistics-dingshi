import React, { Component } from 'react';
import { List, WhiteSpace, Toast, WingBlank } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import MobileForm, { FormItem, FORM_MODE, FormButton } from '@/components/MobileForm'
import { getProjectDetail, getProject } from '@/services/apiService'
import { requestDebounce, isEqual, isObject, sortBy } from '@/utils/utils'
import prebookingModel from '@/models/mobilePrebooking'
import nativeApi from '@/utils/nativeApi'
import DeliveryList from './component/DeliveryList'
import ReceivingList from './component/ReceivingList'

const { actions: { postMobilePrebooking, detailMobilePrebooking, patchMobilePrebooking } } = prebookingModel
const [getProjectDetailDebounce, clear] = requestDebounce(getProjectDetail)

function mapStateToProps (state) {
  return {
    prebooking: state.mobilePrebooking.entity
  }
}

@connect(mapStateToProps, { postMobilePrebooking, detailMobilePrebooking, patchMobilePrebooking })
export default class CreatePrebookingForm extends Component {

  schema = {
    fields: [
      {
        key: 'projectId',
        label: '合同名称',
        component: 'picker',
        placeholder: '请选择合同',
        required: true,
        modifiable: false,
        options: async () => {
          const { items: data } = await getProject({ isAvailable: true, limit:100, offset:0 })
          // 用来屏蔽选择有可以参与合同的入口
          const _data = (data || []).filter(item=>item.isCustomerAudit===0)
          const items = _data || []
          const result = items.map(item => ({
            key: item.projectId,
            value: item.projectId,
            label: item.projectName
          }))
          return result
        },
      },
      {
        key: 'shipmentId',
        label: '选择承运方',
        component: 'picker',
        required: true,
        modifiable: false,
        placeholder: '请选择承运方',
        options: {
          watch: 'projectId',
          action: async (formData) => {
            if (!formData.projectId) return
            const { shipmentItems } = await getProjectDetailDebounce(formData.projectId)// await request(`/v1/projects/${formData.projectId}`)
            return shipmentItems.map(item => {
              if (item.auditStatus===1){
                return { key: item.shipmentOrganizationId, value: item.shipmentOrganizationId, label: item.shipmentOrganizationName }
              }
            }).filter(item => isObject(item))
          }
        }
      },
      {
        key: 'acceptanceTime',
        label: '送达时间',
        component: 'calender',
        required: true,
      },
      {
        key: 'prebookingRemark',
        label: '备注(可选)',
        component: 'input',
        placeholder: '请输入备注'
      },
      {
        key: 'deliveryItems',
        component: DeliveryList,
        options: {
          watch: 'projectId',
          action: async (formData, { form }) => {
            if (!formData.projectId) return
            if (this.state.mode === FORM_MODE.ADD) {
              form.setFieldsValue({ deliveryItems: [] })
            }
            const { deliveryItems, goodsItems } = await getProjectDetailDebounce(formData.projectId)
            return { deliveryItems, goodsItems }
          }
        },
        validator: ({ value, formData }) => {
          if (!value || value.length === 0) {
            return '提货点不能为空'
          }
          if (formData.receivingItems && formData.receivingItems.length > 0 && value && value.length > 0) {
            const receivingItems = formData.receivingItems.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
            const deliveryItems = value.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
            const sortReceivingItems = sortBy(receivingItems, ['goodsId'])
            const sortDeliveryItems = sortBy(deliveryItems, ['goodsId'])
            if (!isEqual(sortReceivingItems, sortDeliveryItems)) {
              return '提货与卸货信息不一致'
            }
          }
        },
      },
      {
        key: 'receivingItems',
        component: ReceivingList,
        options: {
          watch: 'projectId',
          action: async (formData, { form }) => {
            if (!formData.projectId) return
            if (this.state.mode === FORM_MODE.ADD) {
              form.setFieldsValue({ receivingItems: [] })
            }
            const { receivingItems, goodsItems } = await getProjectDetailDebounce(formData.projectId)
            return { receivingItems, goodsItems }
          }
        },
        validator: ({ value, formData }) => {
          if (!value || value.length === 0) {
            return '卸货点不能为空'
          }
          if (formData.deliveryItems && formData.deliveryItems.length > 0 && value && value.length > 0) {
            const receivingItems = value.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
            const deliveryItems = formData.deliveryItems.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
            const sortReceivingItems = sortBy(receivingItems, ['goodsId'])
            const sortDeliveryItems = sortBy(deliveryItems, ['goodsId'])
            if (!isEqual(sortReceivingItems, sortDeliveryItems)) {
              return '提货与卸货信息不一致'
            }
          }
        },
      }
    ],
    operations: [{
      label: '保存',
      type: 'primary',
      action: 'submit',
      onClick: (value) => {
        const [projectId] = value.projectId
        const [shipmentId] = value.shipmentId
        const { mode } = this.state
        mode === FORM_MODE.ADD
          ? this.props.postMobilePrebooking({ ...value, projectId, shipmentId, acceptanceTime: value.acceptanceTime.format(), receivingItems : value.receivingItems || [] })
            .then(() => {
              Toast.success('创建预约单成功', 1)
              setTimeout(() => {
                nativeApi.onBackHome()
              }, 1200);
            })
          : this.props.patchMobilePrebooking({ ...value, projectId, shipmentId, prebookingId: this.props.prebooking.prebookingId, acceptanceTime: value.acceptanceTime.format(), prebookingStatus:undefined, isEffect:undefined, receivingItems : value.receivingItems || [] })
            .then(() => {
              Toast.success('修改预约单成功', 1)
              setTimeout(() => {
                router.push(`prebookingList`)
              }, 1200);
            })
      }
    }]
  }

  constructor (props) {
    super(props)
    this.state = {
      mode: 'mode' in props.location.query
        ? props.location.query.mode
        : FORM_MODE.ADD,
    }
    clear()
  }

  componentDidMount () {
    if (this.state.mode === FORM_MODE.MODIFY) this.props.detailMobilePrebooking({ prebookingId: this.props.location.query.prebookingId })
  }

  render () {
    const { mode } = this.state
    const prebooking = mode === FORM_MODE.ADD
      ? {}
      : this.props.prebooking
    return (
      <MobileForm schema={this.schema} entity={prebooking} mode={mode}>
        <List>
          <FormItem fields='projectId' />
          <FormItem fields='shipmentId' />
          <FormItem fields='acceptanceTime' />
          <FormItem fields='prebookingRemark' />
        </List>
        <WhiteSpace size="lg" />
        <List>
          <FormItem fields='deliveryItems' />
        </List>
        <WhiteSpace size="lg" />
        <List>
          <FormItem fields='receivingItems' />
        </List>
        <WhiteSpace size="lg" />
        <WingBlank>
          <FormButton debounce action='submit' />
        </WingBlank>
      </MobileForm>
    )
  }
}
