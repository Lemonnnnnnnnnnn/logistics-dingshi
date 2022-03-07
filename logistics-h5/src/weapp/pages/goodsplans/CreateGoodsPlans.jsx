import React, { Component } from 'react';
import { SchemaForm, FORM_MODE, Item, FormButton, ErrorNoticeBar, Observer } from '@gem-mine/mobile-schema-form/src';
import '@gem-mine/mobile-schema-form/src/fields'
import { WhiteSpace, Modal, Toast, Button } from 'antd-mobile'
import { connect } from 'dva'
import router from 'umi/router'
import { CUSTOMER, OWNER } from '@/constants/organization/organizationType'
import { postGoodsPlans, getProjectList, getGoodsPlansDetail, getProjectDetail, checkTransport, patchGoodPlans } from '@/services/apiService'
import GoodsCorrelationItems from './components/GoodsCorrelationItems'
import GuestTips from '@/weapp/component/GuestTips/GuestTips'
import { getUserInfo } from '@/services/user'
import { classifyGoodsWeight, isEmpty } from '@/utils/utils'
import TransportCorrelationCnItems from './components/TransportCorrelationCnItems'
import { statistics } from '@/services/goodsplans'
import { PLANSTATUS as PLAN_STATUS, CONSIGNMENT_UNTREATED, CONSIGNMENT_REFUSED, CANCEL, GOINGON, COMPLETE, FINISH } from '@/constants/goodsPlans/goodsPlans'
import styles from './CreateGoodsPlans.css'

const { alert, prompt } = Modal
const planStatusOptions = Object.keys(PLAN_STATUS).map((key, index) => ({ value: index, label: PLAN_STATUS[key] }))

@connect((state)=>({
  nowUser: state.user.nowUser
}), null)
class AddGoodsPlans extends Component {

  state = {
    projectDetail: {},
    isButtonDisabled: false,
    errors: [],
    plansDetail: {},
    mode: 'add',
    ready: false
  }

  organizationType = getUserInfo().organizationType

  isLogin = !!getUserInfo().accessToken

  accountType = getUserInfo().accountType

  schema = {
    planStatus: {
      label: '计划单状态',
      component: 'picker',
      visible: {
        watch: '*mode',
        action: mode => mode !== FORM_MODE.ADD
      },
      disabled: true,
      options: planStatusOptions
    },
    createUserName:{
      label: '创建人',
      component: 'inputItem',
      props:{
        style:{
          textAlign: 'right',
          color: '#888'
        }
      },
      visible: {
        watch: '*mode',
        action: mode => mode !== FORM_MODE.ADD
      },
    },
    goodsStatistics:{
      label: '计划单统计',
      component: TransportCorrelationCnItems
    },
    projectId: {
      label: '合同名称',
      component: 'picker',
      placeholder: '请选择已有合同',
      options: async () => {
        const { items } = await getProjectList({ isPassShipments: true, isAvailable: true, limit: 1000, offset: 0 })
        const usefulOption = (items || []).filter(option => {
          const { customerResponsibleItems } = option
          const isAvailable = (customerResponsibleItems||[]).find( item => item.responsibleId === this.props.nowUser.userId)?.isAvailable
          const auditStatus = (customerResponsibleItems||[]).find( item => item.responsibleId === this.props.nowUser.userId)?.auditStatus
          return (isAvailable && auditStatus === 1) || this.accountType === 1
        })
        return usefulOption.map(item => ({ label: item.projectName, value: item.projectId }))
      },
      props: {
        onOk: (projectId) => {
          checkTransport(projectId)
            .then((res) => {
              this.setState({
                isButtonDisabled: res
              }, () => {
                if (res) {
                  alert('提示', '当前项目有未签收的运单!', [{ text: '返回' }])
                  this.setState({ projectDetail: {} })
                }
              })
              if (!res) return getProjectDetail(projectId)
            })
            .then(projectDetail => {
              if (!projectDetail) return
              this.setState({ projectDetail })
            })
        }
      },
      rules: {
        required: true
      },
      disabled: {
        watch: '*mode',
        action: mode => mode !== FORM_MODE.ADD
      }
    },
    arrivalTime: {
      label: '期望到货时间',
      component: 'calender',
      props: {
        arrow: 'horizontal',
        placeholder: '请选择期望到货时间'
      },
      rules: {
        required: true
      }
    },
    remarks: {
      label: '备注说明',
      component: 'textArea',
      arrow: 'empty',
      props: {
        title: '备注说明',
        rows: 3,
        count: 100,
        placeholder: '还有什么重要的说明',
        autoHeight: true,
        style: {
          background: 'rgba(247,247,247,1)',
          borderRadius: '7px',
          width: '95%',
          fontSize: '12px',
          padding: '3px 10px'
        }
      }
    },
    verifyReason: {
      label: '拒绝理由',
      component: 'textArea',
      props: {
        title: '拒绝理由',
        rows: 3,
        count: 100,
        autoHeight: true,
        style:{
          background: 'rgba(247,247,247,1)',
          borderRadius: '7px',
          width: '94%',
          fontSize: '12px',
          padding: '3px 10px',
          marginTop: '0px'
          // fontSize: '0.2rem',
          // padding: '0.04rem 0.1333rem 0.2666rem 0.1333rem'
        }
      },
      visible: {
        watch: '*mode',
        action: mode => mode === FORM_MODE.DETAIL
      },
    },
    goodsCorrelationItems: {
      label: '卸货点信息',
      component: GoodsCorrelationItems,
      observer: Observer({
        watch: '*projectDetail',
        action: ()=>{
          // 在切换项目的时候，监听获取的projectDetail只取dif部分,信息不全,所以还是从state里取
          const { projectDetail } = this.state
          const optionConfig={
            receivingOptions: projectDetail?.receivingItems?.map(item=>({ label: item.receivingName, value: item.receivingId })),
            goodsOptions: projectDetail?.goodsItems?.map(item=>({
              label: `${item.categoryName}-${item.goodsName}`,
              value: item.goodsId,
              materialQuality: item.materialQuality,
              receivingUnit: item.receivingUnit
            }))
          }
          const disabled = isEmpty(projectDetail)
          return { optionConfig, disabled }
        }
      }),
      rules: {
        required: [true, '请填写卸货信息']
      }
    }
  }

  componentDidMount () {
    const { location: { query: { goodsPlanId } } } = this.props
    let plansDetail
    if (goodsPlanId) {
      const mode = FORM_MODE.DETAIL
      getGoodsPlansDetail(goodsPlanId)
        .then(data => {
          data = statistics(data)
          // data = this.calculatingGoodsTotalNum(data)
          plansDetail = this.reconfigureData(data)
          return getProjectDetail(plansDetail.projectId)
        })
        .then(projectDetail => {
          if (!projectDetail) return
          const { customerResponsibleItems } = projectDetail
          const isAvailable = (customerResponsibleItems||[]).find( item => item.responsibleId === this.props.nowUser.userId)?.isAvailable
          if (isAvailable || isAvailable === undefined || this.accountType === 1) {
            this.setState({
              projectDetail,
              plansDetail,
              mode,
              ready: true
            })
          } else {
            router.replace(`/Weapp/bindContract/error?error=noSameOrganization&word=查看失败`)
          }
        })
    } else {
      this.setState({
        mode: FORM_MODE.ADD,
        ready: true
      })
    }

  }

  calculatingGoodsTotalNum = (data) => {
    //
    data.transportCorrelationCnItems = classifyGoodsWeight(data.transportCorrelationCnItems, 'goodsId',
      [
        'goodsUnit', 'transportCorrelationId', 'goodsId', 'goodsNum', 'deliveryNum', 'receivingNum', 'goodsUnitCN',
        'deliveryUnitCN', 'receivingUnitCN', 'transportImmediateStatus', 'goodsName', 'materialQuality'
      ],
      (summary, current) => {
        // TODO这里需要添加运单状态的判断条件
        summary.goodsNum += current.goodsNum
        summary.deliveryNum += current.deliveryNum
        summary.receivingNum += current.receivingNum
      })
    // 计算要货数量
    data.transportCorrelationCnItems.forEach(transportCorrelationCnItem => {
      transportCorrelationCnItem.goodTotalNum = 0
      data.goodsCorrelationItems.forEach(goodsCorrelationItem => {
        if (transportCorrelationCnItem.goodsId === goodsCorrelationItem.goodsId) {
          transportCorrelationCnItem.goodTotalNum += goodsCorrelationItem.goodsNum
        }
      })
    })
    data.planStatus = [data.planStatus]
    data.projectId = [data.projectId]
    return data
  }

  reconfigureData = plansDetail => {
    plansDetail.planStatus = [plansDetail.planStatus]
    plansDetail.projectId = [plansDetail.projectId]
    const goodsCorrelationItems = plansDetail.goodsCorrelationItems.map(item => {
      Object.keys(item.goodItems[0]).forEach(key => {
        if (item.goodItems[0][key]){
          item[key] = item.goodItems[0][key]
        }
      })
      Object.keys(item.receivingItems[0]).forEach(key => {
        item[key] = item.receivingItems[0][key]
      })
      return item
    })
    plansDetail.goodsCorrelationItems = goodsCorrelationItems
    plansDetail.verifyReason = plansDetail.verifyItems[plansDetail.verifyItems.length-1]?.verifyReason
    return plansDetail
  }

  saveData = formData => {
    const { projectId, goodsCorrelationItems } = formData
    const keys = ['receivingId', 'goodsId', 'goodsNum']
    const isKeysMissing = keys.some(item => Object.keys(goodsCorrelationItems[goodsCorrelationItems.length-1]).indexOf(item) === -1)
    if (isKeysMissing){
      this.setState({ errors:['请完整填写卸货信息'] })
      return
    }
    this.setState({ errors:[] })
    const newData = { ...formData, projectId: projectId[0] }
    postGoodsPlans(newData)
      .then(() => {
        Toast.success('创建成功', 1, router.goBack, false);
      })
  }

  cancelGoodsPlans = () => {
    const { location: { query: { goodsPlanId } } } = this.props
    const params = {
      goodsPlanId,
      planStatus: 4
    }
    patchGoodPlans(params)
      .then(() => {
        Toast.success('撤销成功', 2, router.goBack, false);
      })
  }

  rejectGoodsPlans = (goodsPlanId, remarks) => {
    const params = {
      goodsPlanId,
      planStatus: 1,
      remarks
    }
    patchGoodPlans(params)
      .then(() => {
        Toast.success('已拒绝', 2, router.goBack, false);
      })
  }

  acceptGoodsPlans = () => {
    const { location: { query: { goodsPlanId } } } = this.props
    const params = {
      goodsPlanId,
      planStatus: 2
    }
    patchGoodPlans(params)
      .then(() => {
        Toast.success('已接受', 2, router.goBack, false);
      })
  }

  patchData = formData => {
    const { location: { query: { goodsPlanId } } } = this.props
    const { projectId } = formData
    const newData = { ...formData, projectId: projectId[0], planStatus: CONSIGNMENT_UNTREATED, goodsPlanId }
    patchGoodPlans(newData)
      .then(() => {
        Toast.success('修改成功', 2, router.goBack, false);
      })
  }

  goToRelationPreBookingPage = () => {
    const { location: { query: { goodsPlanId } } } = this.props
    router.push(`prebookingList?goodsPlanId=${goodsPlanId}&tab=5`)
  }

  goToRelationTransportPage = () => {
    const { location: { query: { goodsPlanId } } } = this.props
    router.push(`transportList?goodsPlanId=${goodsPlanId}&tab=9`)
  }

  goCreateGoodsPlansPage = () => {
    const { location: { query: { goodsPlanId } } } = this.props
    router.push(`createPrebookingByGoodsPlan?goodsPlanId=${goodsPlanId}&mode=add`)
  }

  renderButton = () => {
    const { isButtonDisabled, mode, plansDetail: { planStatus = [0] } } = this.state
    const { location: { query: { goodsPlanId } } } = this.props
    const handleCancelBtnClick = () => {
      alert('提示', '计划单撤销后不可恢复 确定要撤销吗？', [
        { text: '取消' },
        { text: '确定', onPress: () => { this.cancelGoodsPlans(goodsPlanId) }, style:{ background:'rgba(49,151,251,1)', color: 'white' } },
      ])
    }
    const handleRejectBtnClick = () => {
      prompt('请输入拒绝原因', null, [
        {
          text: '取消'
        },
        {
          text: '确定',
          onPress: value => {
            if (!value){
              Toast.fail('拒绝理由不得为空', 2, null, false)
              return
            }
            this.rejectGoodsPlans(goodsPlanId, value)
          },
          style:{ background:'rgba(49,151,251,1)', color: 'white' }
        }
      ])
    }
    if ( this.organizationType === CUSTOMER ) {
      if (mode === FORM_MODE.ADD) {
        return <FormButton debounce className={styles.sendBtn} onError={(errors) => this.setState({ errors })} type="primary" label="发送计划单" disabled={isButtonDisabled} onClick={this.saveData} />
      }
      if (mode === FORM_MODE.DETAIL && planStatus[0] === CONSIGNMENT_UNTREATED) {
        return (
          <>
            <Button className={styles.cancelButton} onClick={handleCancelBtnClick}>撤销计划单</Button>
            <Button className={styles.modifyButton} type="primary" onClick={() => { this.setState({ mode: FORM_MODE.MODIFY }) }}>修改计划单</Button>
          </>
        )
      }
      if (mode === FORM_MODE.DETAIL && planStatus[0] === CONSIGNMENT_REFUSED) {
        return <Button className={styles.sendBtn} type="primary" onClick={() => { this.setState({ mode: FORM_MODE.MODIFY }) }}>修改计划单</Button>
      }
      if (mode === FORM_MODE.MODIFY) {
        return <FormButton debounce className={styles.sendBtn} type="primary" label="保存修改" onClick={this.patchData} />
      }
      return <Button type="primary" className={styles.sendBtn} onClick={() => { router.push(`goodsPlanRelationTransport?goodsPlanId=${goodsPlanId}`) }}>查看关联运单</Button>
    }
    if ( this.organizationType === OWNER ){
      switch (planStatus[0]) {
        case CONSIGNMENT_UNTREATED:
          return (
            <>
              <Button className={styles.cancelButton} onClick={handleRejectBtnClick}>拒绝</Button>
              <Button className={styles.modifyButton} type="primary" onClick={this.acceptGoodsPlans}>接受</Button>
            </>
          )
        case CONSIGNMENT_REFUSED:
          return <Button type="primary" className={styles.sendBtn} onClick={router.goBack}>返回</Button>
        case GOINGON:
          return (
            <>
              <Button className={styles.goPrebookingListButton} onClick={this.goToRelationPreBookingPage}>预约单列表</Button>
              <Button className={styles.goTransportListButton} onClick={this.goToRelationTransportPage}>运单列表</Button>
              <Button className={styles.createPrebooking} onClick={this.goCreateGoodsPlansPage}>新建预约单</Button>
            </>
          )
        case COMPLETE:
          return (
            <>
              <Button className={styles.cancelButton} onClick={this.goToRelationPreBookingPage}>预约单列表</Button>
              <Button className={styles.modifyButton} type="primary" onClick={this.goToRelationTransportPage}>运单列表</Button>
            </>
          )
        case FINISH:
          return (
            <>
              <Button className={styles.cancelButton} onClick={this.goToRelationPreBookingPage}>预约单列表</Button>
              <Button className={styles.modifyButton} type="primary" onClick={this.goToRelationTransportPage}>运单列表</Button>
            </>
          )
        default:
          return <Button type="primary" className={styles.sendBtn} onClick={router.goBack}>返回</Button>
      }
    }
  }

  render () {
    const { projectDetail, mode, plansDetail, ready } = this.state
    const { planStatus=[0] } = plansDetail
    const showGoodsStatisticsStatus=[CONSIGNMENT_REFUSED, CONSIGNMENT_UNTREATED, CANCEL]
    return (
      this.isLogin ?
        ready &&
        <div className={styles.createGoodsPlanPage}>
          <SchemaForm schema={this.schema} trigger={{ projectDetail }} mode={mode} data={plansDetail} onChange={() => this.setState({ errors: [] })}>
            <div className={(mode === FORM_MODE.DETAIL && planStatus[0] === CONSIGNMENT_UNTREATED) ? styles.detail : null}>
              <ErrorNoticeBar errors={this.state.errors} />
              <Item field="planStatus" />
              <Item field="createUserName" />
              { showGoodsStatisticsStatus.indexOf(planStatus[0]) === -1 && <Item field="goodsStatistics" />}
              <Item field="projectId" />
              <Item field="arrivalTime" />
              <Item field="remarks" />
              <Item field="verifyReason" />
              <WhiteSpace />
              <Item field="goodsCorrelationItems" />
              {this.renderButton()}
            </div>
          </SchemaForm>
        </div>
        :
        <GuestTips />
    )
  }
}

export default AddGoodsPlans;
