import React, { Component } from 'react';
import { SchemaForm, FORM_MODE, Item, FormButton, Observer, ErrorNoticeBar } from '@gem-mine/mobile-schema-form';
import { WhiteSpace, Toast } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { getGoodsPlansList, getProject, getProjectDetail } from '@/services/apiService'
import { requestDebounce, uniqBy, sortBy, isEqual } from '@/utils/utils'
import goodsPlanModel from '@/models/goodsPlan'
import prebookingModel from '@/models/mobilePrebooking'
import DeliveryList from './component/_DeleiveryList'
import ReceivingList from './component/_ReceivingList'
import '@gem-mine/mobile-schema-form/src/fields'

const [getProjectDetailDebounce, clear] = requestDebounce(getProjectDetail)

const { actions: { postMobilePrebooking, detailMobilePrebooking, patchMobilePrebooking } } = prebookingModel
const { actions: { detailGoodsPlan } } = goodsPlanModel

function mapStateToProps (state) {
  return {
    goodsPlan: state.goodsPlan.entity,
    prebooking: state.mobilePrebooking.entity
  }
}

@connect(mapStateToProps, { detailGoodsPlan, detailMobilePrebooking, postMobilePrebooking, patchMobilePrebooking })
class CreatePrebookingByGoodsPlan extends Component {

  constructor (props) {
    super(props)
    clear()
    this.schema = {
      projectId:{
        label: '合同名称',
        component: 'picker.text',
        placeholder: '请选择合同',
        rules:{
          required: [true, '请选择合同'],
        },
        options: async () => {
          const { items: data } = await getProject({ isPassShipments: true, isAvailable: true, limit:100, offset:0 })
          // 用来屏蔽选择无客户参与合同的入口
          const _data = data.filter(item=>item.isCustomerAudit===1)
          const items = _data || []
          const result = items.map(item => ({
            key: item.projectId,
            value: item.projectId,
            label: item.projectName
          }))
          return result
        },
      },
      goodsPlanId:{
        label: '要货计划单',
        component: 'picker.text',
        placeholder: '请选择计划单',
        rules:{
          required: [true, '请选择计划单'],
        },
        options:Observer({
          watch: 'projectId',
          action: async (projectId) => {
            let goodsPlan
            if ((!projectId)||projectId.length===0) {
              goodsPlan = []
            } else {
              const { items } = await getGoodsPlansList({ projectId, planStatus:2, limit:100, offset:0 })// await request(`/v1/projects/${formData.projectId}`)
              goodsPlan = items
            }
            return goodsPlan.map(item => ({ key: item.goodsPlanId, value: item.goodsPlanId, label: item.goodsPlanName }))
          }
        }),
        value:Observer({
          watch: 'projectId',
          action:() =>{
            console.log(this.props.location.query.goodsPlanId)
            return [+this.props.location.query.goodsPlanId]||undefined
          }
        })
      },
      shipmentId:{
        label: '选择承运方',
        component: 'picker',
        placeholder: '请选择承运方',
        rules:{
          required: [true, '请选择承运方'],
        },
        options:Observer({
          watch: 'projectId',
          action: async (projectId) => {
            let shipment
            if ((!projectId)||projectId.length===0) {
              shipment = []
            } else {
              const { shipmentItems } = await getProjectDetailDebounce(projectId)// await request(`/v1/projects/${formData.projectId}`)
              shipment = shipmentItems
            }
            return shipment
              .filter(item => item.auditStatus===1)
              .map(item=>({ key: item.shipmentOrganizationId, value: item.shipmentOrganizationId, label: item.shipmentOrganizationName }))
          }
        }),
        // value:Observer({
        //   watch: 'projectId',
        //   action:() =>undefined
        // })
      },
      acceptanceTime:{
        label: '送达时间',
        component: 'calender',
        rules:{
          required: [true, '请选择送达时间'],
        },
        props:{
          arrow:'horizontal'
        },
        placeholder: '请选择送达时间',
      },
      prebookingRemark:{
        label: '备注(可选)',
        component: 'inputItem',
        placeholder: '请输入备注'
      },
      deliveryItems:{
        component: DeliveryList,
        rules:{
          required: [true, "请输入提货信息"],
          validator: ({ formData, value }) => {
            if (formData.receivingItems && formData.receivingItems.length > 0 && value && value.length > 0) {
              const receivingItems = formData.receivingItems.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
              const deliveryItems = value.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
              const sortReceivingItems = sortBy(receivingItems, ['goodsId'])
              const sortDeliveryItems = sortBy(deliveryItems, ['goodsId'])
              if (!isEqual(sortReceivingItems, sortDeliveryItems)) {
                return '提货与卸货信息不一致'
              }
            }
            if (!value || !value.length) {
              return '请输入提货信息'
            }
          }
        },
        props:{
          setErrors: this.setErrors
        },
        observer: Observer({
          watch: 'goodsPlanId',
          action: async (goodsPlanId, { formData }) => {
            console.log(goodsPlanId)
            // 目前根据redux内获取goodsPlan的详情内容，若后续修改为自定义创建，则需要在action内发起请求，请求使用节流控制
            const { projectId } = formData
            if ((!projectId)||projectId.length===0) return {}
            const { deliveryItems } = await getProjectDetailDebounce(projectId)
            const { goodsPlan:{ goodsCorrelationItems=[] } } = this.props
            const goodsItems = goodsCorrelationItems.map(item=>({
              ...item.goodItems[0],
              goodsNum:item.goodsNum,
              deliveryUnitCN:item.goodsUnitCN,
              receivingUnitCN:item.goodsUnitCN,
              deliveryUnit:item.goodsUnit,
              receivingUnit:item.goodsUnit
            }))
            return { deliveryItems, goodsItems }
          }
        }),
      },
      receivingItems:{
        component: ReceivingList,
        rules:{
          required: [true, '请输入卸货信息'],
          validator: ({ formData, value }) => {
            if (formData.deliveryItems && formData.deliveryItems.length > 0 && value && value.length > 0) {
              const deliveryItems = formData.deliveryItems.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
              const receivingItems = value.map(item => ({ goodsId:item.goodsId, goodsNum:item.receivingNum }))
              const sortReceivingItems = sortBy(receivingItems, ['goodsId'])
              const sortDeliveryItems = sortBy(deliveryItems, ['goodsId'])
              if (!isEqual(sortReceivingItems, sortDeliveryItems)) {
                return '提货与卸货信息不一致'
              }
            }
            if (!value || !value.length) {
              return '请输入卸货信息'
            }
          }
        },
        props:{
          setErrors:this.setErrors
        },
        observer: Observer({
          watch: 'goodsPlanId',
          action: async (goodsPlanId, { formData }) => {
            console.log(goodsPlanId)
            // 目前根据redux内获取goodsPlan的详情内容，若后续修改为自定义创建，则需要在action内发起请求，请求使用节流控制
            const { projectId } = formData
            if ((!projectId)||projectId.length===0) return {}
            // const { receivingItems:receiving, goodsItems:_goodsItems } = await getProjectDetailDebounce(projectId)
            const { goodsPlan:{ goodsCorrelationItems } } = this.props
            const receivingItems = uniqBy(goodsCorrelationItems.map(item=>item.receivingItems[0]), 'receivingId')
            const goodsItems = goodsCorrelationItems.map(item=>({
              ...item.goodItems[0],
              deliveryUnitCN:item.goodsUnitCN,
              receivingUnitCN:item.goodsUnitCN,
              deliveryUnit:item.goodsUnit,
              receivingUnit:item.goodsUnit
            }))
            return { receivingItems, goodsItems }
          }
        }),
      }
    }

    this.state = {
      ready:false,
      errors: [],
      mode:props.location.query.mode
    }
  }

  componentDidMount (){
    const { location:{ query:{ goodsPlanId, prebookingId } }, detailGoodsPlan, detailMobilePrebooking } = this.props
    if (goodsPlanId && !prebookingId) {
      detailGoodsPlan({ goodsPlanId })
        .then((detail)=>{
          const { goodsPlanId, projectId } = detail
          const data = {
            goodsPlanId:[goodsPlanId],
            projectId:[projectId],
          }
          this.setState({
            ready:true,
            data
          })
        })
    } else if (goodsPlanId && prebookingId) {
      detailGoodsPlan({ goodsPlanId })
        .then(()=>detailMobilePrebooking({ prebookingId }))
        .then(detail=>{
          const { goodsPlanId, projectId, shipmentId, acceptanceTime, prebookingRemark, receivingItems, deliveryItems } = detail
          const data = {
            goodsPlanId:[goodsPlanId],
            projectId,
            shipmentId,
            acceptanceTime,
            prebookingRemark,
            receivingItems,
            deliveryItems
          }
          this.setState({
            ready:true,
            data
          })
        })
    }
  }

  createPrebooking = (value) =>{
    const [projectId] = value.projectId
    const [goodsPlanId] = value.goodsPlanId
    const [shipmentId] = value.shipmentId
    const { mode } = this.state
    mode === FORM_MODE.ADD
      ? this.props.postMobilePrebooking({ ...value, projectId, shipmentId, acceptanceTime: value.acceptanceTime.format(), goodsPlanId, receivingItems : value.receivingItems || [] })
        .then(() => {
          router.goBack()
          Toast.success('创建预约单成功', 1)
        })
      : this.props.patchMobilePrebooking({ ...value, goodsPlanId, projectId, shipmentId, prebookingId: this.props.prebooking.prebookingId, acceptanceTime: value.acceptanceTime.format(), receivingItems : value.receivingItems || [] })
        .then(() => {
          router.push(`prebookingList`)
          Toast.success('修改预约单成功', 1)
        })
  }

  setErrors = (errors) => this.setState({ errors })

  render () {
    const { ready, errors, data, mode } = this.state
    return (
      <>
        {ready&&
        <SchemaForm schema={this.schema} data={data} mode={FORM_MODE.ADD} onChange={() => this.setState({ errors: [] })}>
          <ErrorNoticeBar errors={errors} />
          <Item field="projectId" />
          <Item field="goodsPlanId" />
          <Item field="shipmentId" />
          <Item field="acceptanceTime" />
          <Item field="prebookingRemark" />
          <WhiteSpace size="lg" />
          <Item field="deliveryItems" />
          <WhiteSpace size="lg" />
          <Item field="receivingItems" />
          <FormButton
            onError={(errors) => {
              this.setState({ errors })
            }}
            debounce
            style={{ borderRadius: '23.5px', marginTop:'15px' }}
            onClick={this.createPrebooking}
            type="primary"
            label={mode===FORM_MODE.ADD?"创建预约单":"修改预约单"}
          />
        </SchemaForm>}
      </>
    )
  }
}

export default CreatePrebookingByGoodsPlan;
