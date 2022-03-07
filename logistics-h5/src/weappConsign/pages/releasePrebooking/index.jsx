import React from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'dva'
import { Button, Picker, List, Drawer, InputItem, Toast } from 'antd-mobile'
import { SchemaForm, Item, FormButton, ErrorNoticeBar } from '@gem-mine/mobile-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton'
import '@gem-mine/mobile-schema-form/src/fields'
import { Observer } from '@gem-mine/mobile-schema-form/src'
import router from 'umi/router'
import { getProjects, postPrebookings, postPrebookingsReleaseHall, patchPrebookings } from '@/services/apiService'
import model from '@/models/contract'
import { isEqual, sortBy, uniqBy } from '@/utils/utils'
import FieldInput from '@/mobile/page/driverApp/component/FieldInput'
import DatePicker from './components/DatePicker'
import styles from './index.less'

const { actions: { detailProjects } } = model

function mapStateToProps (state) {
  return {
    projectInfo: state.project.entity
  }
}

@connect(mapStateToProps, { detailProjects })
@CSSModules(styles, { allowMultiple: true })
export default class releasePrebookingIndex extends React.Component {
  state = {
    ready: false,
    errors: [],
    defaultValue:{
    }
  }

  projectLists = {
    items: [],
    count: 0
  }

  formSchema = {
    projectId: {
      label: '项目',
      component: 'picker',
      rules: {
        required: [true, '请选择项目'],
      },
      placeholder: '请选择项目',
      visible: !this.props.prebookingId,
      options: Observer({
        watch: '*projectLists',
        action: (projectLists) => projectLists.map(item => ({
          key: item.projectId,
          value: item.projectId,
          label: item.projectName
        }))
      })
    },
    shipmentId: {
      label: '承运',
      component: 'picker',
      rules: {
        required: [true, '请选择承运方'],
      },
      placeholder: '请选择承运',
      options: Observer({
        watch: ['projectId', '*projectInfo'],
        action: async ([projectId, projectInfo], { form }) => {
          if (this.props.projectId) {
            return projectInfo && projectInfo.shipmentItems.map(item => ({
              label: item.shipmentOrganizationName,
              key: item.shipmentOrganizationId,
              value: item.shipmentOrganizationId,
            })) || []
          }
          form.setFieldsValue({ shipmentId: undefined })
          if (!projectId) return []
          const res = await this.props.detailProjects({ projectId })
          let { shipmentItems } = res
          this.setState({
            ready: true
          })
          shipmentItems = shipmentItems.filter(item => item.auditStatus === 1)
          return shipmentItems.map(item => ({
            label: item.shipmentOrganizationName,
            key: item.shipmentOrganizationId,
            value: item.shipmentOrganizationId,
          }))
        }
      })
    },
    acceptanceTime: {
      label: '用车时间',
      component: DatePicker,
      rules: {
        required: [true, '请选择用车时间'],
      },
    },
    maxAvailableOrders: {
      label: '所需车辆数',
      component: 'inputItem',
      rules: {
        required: [true, '请输入所需车辆数'],
        validator: ({ value }) => {
          const reg = /^\+?[1-9]\d*$/
          if (!reg.test(value)) return '车辆数为大于0的整数'
        }
      },
      visible: Observer({
        watch: '*projectInfo',
        action: projectInfo => {
          // if (!projectId || !this.projectLists) return false
          // const current = this.projectLists.items.find(item => item.projectId === projectId[0])
          if (!projectInfo) return false
          const current = projectInfo
          if (!current.logisticsBusinessTypeEntity) return false
          if (current.logisticsBusinessTypeEntity.releaseHall === 1) return true
          return false
        }
      }),
      placeholder: '请输入所需车辆数'
    },
    prebookingRemark: {
      label: '备注信息',
      component: 'inputItem',
      placeholder: '备注信息（选填）'
    },
    deliveryItems: {
      component: deliveryCard,
      rules: {
        required: [true, '请添加提货信息'],
        validator: ({ value }) => {
          const flag = value.some((item) => !/^\d+(\.\d+)?$/.test(item.receivingNum))
          if (flag) return '预约重量只能是数字'
        },
      },
      observer: Observer({
        watch: 'projectId',
        action: projectId => {
          if (projectId) return ({ projectId: projectId[0], type: 1 })
          return { type: 1 }
        }
      }),
    },
    receivingItems: {
      component: deliveryCard,
      rules: {
        required: [true, '请添加卸货信息'],
        validator: ({ value }) => {
          const flag = value.some((item) => !/^\d+(\.\d+)?$/.test(item.receivingNum))
          if (flag) return '预约重量只能是数字'
        },
      },
      observer: Observer({
        watch: 'projectId',
        action: projectId => {
          if (projectId) return ({ projectId: projectId[0], type: 2 })
          return { type: 2 }
        }
      }),
      visible: Observer({
        watch: '*projectInfo',
        action: projectInfo => {
          if (!projectInfo || !projectInfo.logisticsBusinessTypeEntity) return true
          return projectInfo.logisticsBusinessTypeEntity.receivingType !== 3
        }
      }),
    },
    transportFreight: {
      observer: Observer({
        watch: '*projectInfo',
        action: projectInfo => {
          if (!projectInfo) return ''
          if (!this.props.projectInfo.logisticsBusinessTypeEntity) return { value: this.props.projectInfo.freightPrice, extra: '元' }
          const measurementUnit = {
            1: '吨/公里',
            2: '方',
            3: '元/吨',
            4: '元/方',
            5 : '元/车'
          }[this.props.projectInfo.logisticsBusinessTypeEntity.measurementUnit]
          if (this.props.prebookingInfo) return { value: this.props.prebookingInfo.maximumShippingPrice, extra: measurementUnit || '元' }
          return { value: this.props.projectInfo.freightPrice, extra: measurementUnit || '元' }
        }
      }),
      rules: {
        required: [true, '请输入运输费用'],
        validator: ({ value }) => {
          if (!/^\d+\.?\d{0,2}$/.test(value)) return '请正确输入运输费用'
          if (value <= 0) return '请正确输入运输费用'
        },
      },
      label: '运输费用',
      component: 'inputItem',
    }
  }

  componentDidMount () {
    if (!this.props.projectId) {
      getProjects({ offset: 0, limit: 10000, order: 'desc', isPassShipments: true, isAvailable: true }).then(data => {
        this.projectLists = data
        this.setState({
          ready: true,
        })
      }).then(()=>{

        const { location: { query: { projectId } } } = this.props
        if (projectId){
          this.projectLists.items.forEach(item=>{
            if (item.projectId=== Number(projectId)){
              this.setState({
                ready: true,
                defaultValue:{
                  projectId:[Number(projectId)],
                }
              })
            }
          })

        }
      })
    }

    this.setState({
      ready: true,
    })
  }

  submitForm = data => {
    const { projectInfo } = this.props
    try {
      if (!projectInfo.logisticsBusinessTypeEntity || projectInfo.logisticsBusinessTypeEntity.receivingType !== 3) {
        if (projectInfo.logisticsBusinessTypeEntity.deliveryType !== 3) {
          if (projectInfo.logisticsBusinessTypeEntity.releaseHall === 1 && data.receivingItems.length > 1) {
            if (uniqBy(data.receivingItems, 'prebookingObjectId').length > 1) throw new Error('该项目设置为单卸货点') // 多提 单卸
          }
          if (projectInfo.logisticsBusinessTypeEntity.releaseHall === 1 && projectInfo.logisticsBusinessTypeEntity.deliveryType === 1 && data.deliveryItems.length > 1) throw new Error('该项目设置为单提货点') // 多提 单卸
          if (projectInfo.logisticsBusinessTypeEntity.deliveryType === 2 || projectInfo.logisticsBusinessTypeEntity.deliveryType === 1) {
            const goodsIdArr = Array.from(new Set(data.deliveryItems.map(current => current.goodsId)))
            if (goodsIdArr.length !== data.deliveryItems.length) throw new Error('无法选择重复货品')
            const sortReceivingItems = sortBy(data.receivingItems.map(current => {
              if (!current.prebookingObjectId && current.prebookingObjectId !== 0) {
                throw new Error('请选择卸货点')
              }
              if (!current.goodsId && current.goodsId !== 0) {
                throw new Error('请选择货品')
              }
              if (!current.receivingNum && current.receivingNum !== 0) {
                throw new Error('请输入预约重量')
              }
              return {
                goodsId: current.goodsId,
                receivingNum: current.receivingNum
              }
            }), ['goodsId'])
            const sortDeliveryItems = sortBy(data.deliveryItems.map(current => {
              if (!current.prebookingObjectId && current.prebookingObjectId !== 0) {
                throw new Error('请选择提货点')
              }
              if (!current.goodsId && current.goodsId !== 0) {
                throw new Error('请选择货品')
              }
              if (!current.receivingNum && current.receivingNum !== 0) {
                throw new Error('请输入预约重量')
              }
              return {
                goodsId: current.goodsId,
                receivingNum: current.receivingNum
              }
            }), ['goodsId'])
            if (!isEqual(sortReceivingItems, sortDeliveryItems)) throw new Error('提货与卸货信息不一致')
          }
        }
      }
      if (projectInfo.logisticsBusinessTypeEntity && projectInfo.logisticsBusinessTypeEntity.receivingType === 3) {
        // 无卸货点
        if (projectInfo.logisticsBusinessTypeEntity.releaseHall === 1 && projectInfo.logisticsBusinessTypeEntity.deliveryType === 1 && data.deliveryItems.length > 1) throw new Error('该项目设置为单提货点')
        const goodsIdArr = Array.from(new Set(data.deliveryItems.map(current => current.goodsId)))
        if (goodsIdArr.length !== data.deliveryItems.length) throw new Error('无法选择重复货品')
        data.deliveryItems.forEach(current => {
          if (!current.prebookingObjectId && current.prebookingObjectId !== 0) {
            throw new Error('请选择提货点')
          }
          if (!current.goodsId && current.goodsId !== 0) {
            throw new Error('请选择货品')
          }
          if (!current.receivingNum && current.receivingNum !== 0) {
            throw new Error('请输入预约重量')
          }
        })
      }
    } catch (e) {
      return Toast.fail(e.message)
    }
    const formData = JSON.parse(JSON.stringify(data))
    if (!formData.receivingItems){
      formData.receivingItems = []
    }
    formData.projectId = formData.projectId[0]
    formData.shipmentId = formData.shipmentId[0]
    // (formData.deliveryItems || []).forEach((item, index) => {
    //   delete formData.deliveryItems[index].itemId
    // })
    // (formData.receivingItems || []).forEach((item, index) => {
    //   delete formData.receivingItems[index].itemId
    // })
    const releaseHall = this.props.projectInfo.logisticsBusinessTypeEntity && this.props.projectInfo.logisticsBusinessTypeEntity.releaseHall
    formData.maximumShippingPrice = formData.minimumShippingPrice = formData.transportFreight
    delete formData.transportFreight
    if (this.props.projectId) {
      formData.prebookingId = this.props.prebookingId
      patchPrebookings(formData).then(() => {
        Toast.success('预约单修改成功', 2, () => router.replace(`/WeappConsign/main/prebookingDetail?prebookingId=${this.props.prebookingId}`), true)
      })

    }
    if (!releaseHall) {
      postPrebookings(formData).then(res => {
        this.setState({
          clickOff: true
        })
        Toast.success('预约单发布成功', 2, () => {
          router.replace(`/WeappConsign/main/prebookingDetail?prebookingId=${res.prebookingId}`)
        }, true)
      })
    } else {
      postPrebookingsReleaseHall(formData).then(res => {
        this.setState({
          clickOff: true
        })
        Toast.success('预约单发布成功', 2, () => {
          router.replace(`/WeappConsign/prebookingQRCode?prebookingId=${res.prebookingId}&prebookingNo=${res.prebookingNo}`)
        }, true)
      })
    }
  }

  renderErrors = (errors) => {
    Toast.fail(errors[0])
  }

  render () {
    const { ready, errors, clickOff, defaultValue } = this.state
    const { projectInfo, prebookingInfo } = this.props
    const newProjectInfo = JSON.parse(JSON.stringify(projectInfo))
    return (
      ready
      &&
      <div className='weApp_consign_releasePrebooking_form'>
        <SchemaForm schema={this.formSchema} trigger={{ projectLists: (this.projectLists.items || []), projectInfo: newProjectInfo, prebookingInfo }} data={prebookingInfo || defaultValue}>
          <ErrorNoticeBar errors={errors} />
          <div className='weApp_consign_releasePrebooking_form_borderBottom'>
            <Item field='projectId' />
          </div>
          <div className='weApp_consign_releasePrebooking_form_borderBottom'>
            <Item field='shipmentId' />
          </div>
          <div className='weApp_consign_releasePrebooking_form_borderBottom'>
            <Item field='acceptanceTime' />
          </div>
          <div className='weApp_consign_releasePrebooking_form_borderBottom'>
            <Item field='maxAvailableOrders' />
          </div>
          <div>
            <Item field='prebookingRemark' />
          </div>
          <div styleName='item_container'>
            <Item field='deliveryItems' />
            <Item field='receivingItems' />
            <Item field='transportFreight' />
            {
              !this.props.projectId ?
                <DebounceFormButton disabled={clickOff} styleName='marTop15' debounce type='primary' label='发布预约单' onError={this.renderErrors} onClick={this.submitForm} />
                :
                <DebounceFormButton disabled={clickOff} styleName='marTop15' debounce type='primary' label='修改预约单' onError={this.renderErrors} onClick={this.submitForm} />
            }
          </div>
        </SchemaForm>
      </div>
    )
  }
}

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
class deliveryCard extends React.Component {

  state = {
    delivery: [],
  }

  itemId = 0

  flag = 1

  // componentDidMount () {
  //   if (this.props.value) this.setState({
  //     delivery: this.props.value
  //   })
  // }

  setItemValue = (value, itemId, field, shouldRender) => {
    // if (!value && value !== 0) return
    console.log(value)
    const { delivery } = this.state
    const index = delivery.findIndex(item => item.itemId === itemId)
    delivery[index][field] = typeof (value) === 'object' ? value[0] : value
    this.props.onChange(delivery)
    if (!shouldRender) return
    this.setState({
      delivery
    })
  }

  setPrebookingObjectId = (prebookingObjectId, itemId) => this.setItemValue(prebookingObjectId, itemId, 'prebookingObjectId')

  setReceivingNum = (receivingNum, itemId) => this.setItemValue(receivingNum, itemId, 'receivingNum')

  setGoodsId = (goodsId, itemId) => {
    const { projectInfo } = this.props
    if (!projectInfo.goodsItems) return
    const current = projectInfo.goodsItems.find(item => item.goodsId === goodsId[0])
    this.setItemValue(current.deliveryUnit, itemId, 'goodsUnit')
    this.setItemValue(goodsId, itemId, 'goodsId')
  }

  deleteItem = e => {
    const itemId = e.target.getAttribute('itemID')
    const { delivery } = this.state
    const index = delivery.findIndex(item => item.itemId === Number(itemId))
    delivery.splice(index, 1)
    this.props.onChange(delivery)
    this.setState({
      delivery
    })
  }

  addDelivery = () => {
    this.itemId++
    const { delivery } = this.state
    delivery.push({
      itemId: this.itemId,
      prebookingObjectId: '',
      goodsId: '',
      receivingNum: '',
      goodsUnit: ''
    })
    this.props.onChange(delivery)
    this.setState({
      delivery
    })
  }

  shouldComponentUpdate (nextProps) {
    if (nextProps.field.projectId !== this.props.field.projectId && this.props.field.projectId) {
      this.resetDelivery()
      return false
    }
    if (this.flag === 1 && this.props.value) {
      this.flag++
      this.setState({
        delivery: this.props.value
      })
    }
    return true
  }

  getUnit = (goodsUnit) => {
    if (!goodsUnit && goodsUnit !== 0) return ''
    return {
      0: '吨',
      1: '方',
      2: '米',
      3: '根',
      4: '袋',
      5: '张',
    }[goodsUnit]
  }

  resetDelivery = () => {
    this.props.onChange([])
    this.setState({
      delivery: []
    })
  }

  render () {
    const { projectInfo } = this.props
    const { delivery } = this.state
    return (
      <div className='weApp_consign_releasePrebooking_form_ItemCard'>
        {
          delivery.length > 0 ?
            delivery.map(item => (
              <div styleName='mar_bot15' key={item.itemId}>
                {this.props.field.type === 1 ?
                  <Picker
                    data={projectInfo.projectId && projectInfo.deliveryItems.map(item => ({ key: item.deliveryId, value: item.deliveryId, label: item.deliveryName })) || []}
                    title="选择提货点"
                    cols={1}
                    extra="请选择提货点"
                    value={[item.prebookingObjectId]}
                    onOk={value => this.setPrebookingObjectId(value, item.itemId)}
                  >
                    <List.Item arrow="horizontal">提货点</List.Item>
                  </Picker>
                  :
                  <Picker
                    data={projectInfo.projectId && projectInfo.receivingItems.map(item => ({ key: item.receivingId, value: item.receivingId, label: item.receivingName })) || []}
                    title="选择卸货点"
                    cols={1}
                    extra="请选择卸货点"
                    value={[item.prebookingObjectId]}
                    onOk={value => this.setPrebookingObjectId(value, item.itemId)}
                  >
                    <List.Item arrow="horizontal">卸货点</List.Item>
                  </Picker>
                }
                <div styleName='borderBottom' />
                <Picker
                  data={projectInfo.projectId && projectInfo.goodsItems.map(item => ({ key: item.goodsId, value: item.goodsId, label: `${item.categoryName}${item.goodsName}` })) || []}
                  title="选择货品"
                  cols={1}
                  extra="请选择货品"
                  value={[item.goodsId]}
                  onOk={value => this.setGoodsId(value, item.itemId)}
                >
                  <List.Item arrow="horizontal">货品</List.Item>
                </Picker>
                <FieldInput field={{ prefixCls:'billNumber', label: '预约重量', extra: this.getUnit(item.goodsUnit) }} value={`${item.receivingNum}`} onChange={val => this.setReceivingNum(val, item.itemId)} />
                <div styleName='deleteBtn' itemID={item.itemId} onClick={this.deleteItem}>{this.props.field.type === 1 ? '删除提货信息' : '删除卸货信息'}</div>
              </div>
            ))
            :
            null
        }
        {
          this.props.field.type === 1 ?
            <Button styleName='color_blue' onClick={this.addDelivery}>添加提货信息</Button>
            :
            <Button styleName='color_blue' onClick={this.addDelivery}>添加卸货信息</Button>
        }
      </div>
    )
  }
}
