import React, { Component } from 'react'
import WxImageViewer from 'react-wx-images-viewer'
import router from 'umi/router'
import { Carousel, SegmentedControl, WhiteSpace, Toast } from 'antd-mobile'
import { connect } from 'dva'
import MobileForm, { FormItem, FORM_MODE, FormButton } from '@/components/MobileForm'
import { SHIPMENT_RECEIPT_STATUS, CONSIGNMENT_RECEIPT_STATUS } from '@/constants/project/project'
import 'react-imageview/dist/react-imageview.min.css'
import transportModel from '@/models/transports'
import { getOssImg } from '@/utils/utils'
import { auditedReceipt } from '@/services/apiService'
import { getUserInfo } from '@/services/user'

const { actions: { detailTransports } } = transportModel

const RECEIPT_STATUS = {
  INIT: 0,
  UNAUDITED: 1,
  NOT_PASS: 2,
  AUDITED_PASS: 3,
}

function mapStateToProps (state) {
  return {
    transport: state.transports.entity,
  }
}

@connect(mapStateToProps, { detailTransports })
export default class TransportAudited extends Component {

  organizationType = +(getUserInfo().organizationType)

  state = {
    verifyStatus: 0,
    ready: false,
    rejectIndex: 0,
    deliveryPointItem: [],
    weighPointItem: [],
    index: 0,
    isOpen: false,
    imagelist: [],
  }

  getNoPassItems = () => {
    const { transport: { deliveryItems = [], signItems = [] } } = this.props
    const noPassdeliveryItems = this.filterNoPassDelivery(deliveryItems)
    const noPassWeighItems = this.filterNoPassWeighItem(signItems)
    const noPassSignItems = this.filterNoPassSignItem(signItems)
    return {
      length: noPassdeliveryItems.length + noPassWeighItems.length + noPassSignItems.length,
      items: { noPassdeliveryItems, noPassWeighItems, noPassSignItems },
      arr: [...noPassdeliveryItems, ...noPassWeighItems, ...noPassSignItems],
    }
  }

  computeReceiptStatus (pointItems) {
    let status = RECEIPT_STATUS.AUDITED_PASS
    pointItems.forEach(item => {
      if (item.verifyStatus === 0) {
        status = RECEIPT_STATUS.NOT_PASS
        return false
      }
    })
    return status
  }

  schema = {
    fields: [
      {
        key: 'verifyReason',
        label: '????????????',
        component: 'textArea',
        placeholder: '?????????????????????',
        required: true,
      },
    ],
    operations: [{
      label: '??????',
      type: 'primary',
      display: () => {
        const { rejectIndex } = this.state
        return rejectIndex === this.getNoPassItems().length - 1
      },
      action: 'submit',
      style: { textAlign: 'center', margin: '0 10px' },
      onClick: (value, form) => {
        const { validateFields } = form
        let check = false

        validateFields(error => {
          if (error) {
            check = true
          }
        })
        if (check) return Toast.fail('?????????????????????')

        const { transport: { transportId } } = this.props
        const { verifyStatus, rejectIndex, deliveryPointItem, weighPointItem } = this.state
        const nodeArr = this.getNoPassItems().arr
        const node = nodeArr[rejectIndex]
        let lastPointItem = []

        switch (node.type) {
          case 'weigh' : {
            lastPointItem = [{
              verifyObjectId: node.processPointId,
              verifyStatus,
              verifyReason: value.verifyReason,
              additionalType: 2,
            }]
            break
          }
          case 'receiving' : {
            lastPointItem = [{
              verifyObjectId: node.processPointId,
              verifyStatus,
              verifyReason: value.verifyReason,
              additionalType: 1,
            }]
            break
          }
          default : {
            deliveryPointItem[rejectIndex] = {
              verifyObjectId: node.processPointId,
              verifyStatus,
              verifyReason: value.verifyReason,
            }
          }
        }

        // ???????????????????????????????????????
        const receivingPointItem = [...weighPointItem, ...lastPointItem]

        // ??????????????????????????????????????????????????????
        const pointItems = [...deliveryPointItem, ...receivingPointItem]
        const receiptStatus = this.computeReceiptStatus(pointItems)

        // ???????????????????????? ,?????? ????????????????????????????????????????????????????????????
        const params = {
          deliveryPointItem: deliveryPointItem.filter(item => item.verifyStatus === 0),
          receivingPointItem: receivingPointItem.filter(item => item.verifyStatus === 0),
          transportId,
        }

        if (this.organizationType === 5) { // ?????????????????????????????????
          params.shipmentReceiptStatus = receiptStatus
        } else {
          params.consignmentReceiptStatus = receiptStatus
        }

        auditedReceipt(params)
          .then(() => {
            Toast.success('??????????????????', 1)
            router.goBack()
          })

      },
    },
    {
      label: '?????????',
      type: 'default',
      display: () => {
        const { rejectIndex } = this.state
        return rejectIndex !== this.getNoPassItems().length - 1
      },
      action: 'next',
      style: { textAlign: 'center', margin: '0 10px' },
      onClick: (value, form) => {
        const { rejectIndex, deliveryPointItem, verifyStatus } = this.state
        const nodeArr = this.getNoPassItems().arr
        const node = nodeArr[rejectIndex]
        const nextRejectIndex = rejectIndex + 1
        if (nextRejectIndex === (this.getNoPassItems().length)) return
        const { validateFields } = form
        let check = false
        let weighPointItem = []

        validateFields(error => {
          if (error) {
            check = true
          }
        })
        if (check) return Toast.fail('?????????????????????')

        if (node.type === 'weigh') {
          weighPointItem = [{
            verifyObjectId: node.processPointId,
            verifyStatus,
            verifyReason: value.verifyReason,
            additionalType: 2,
          }]
        } else {
          deliveryPointItem[rejectIndex] = {
            verifyObjectId: node.processPointId,
            verifyStatus,
            verifyReason: value.verifyReason,
          }
        }

        const pointItem = [...deliveryPointItem, ...weighPointItem]

        this.setState({
          deliveryPointItem,
          weighPointItem,
          pointItem,
          verifyStatus: 0,
          rejectIndex: nextRejectIndex,
        })
      },
    },
    {
      label: '?????????',
      type: 'default',
      display: () => {
        const { rejectIndex } = this.state
        return rejectIndex !== 0
      },
      action: 'last',
      style: { textAlign: 'center', margin: '0 10px' },
      onClick: () => {
        const { rejectIndex, deliveryPointItem, pointItem } = this.state
        const lastRejectIndex = rejectIndex - 1
        this.setState({
          // verifyStatus: deliveryPointItem[lastRejectIndex].verifyStatus,
          verifyStatus: pointItem[lastRejectIndex].verifyStatus,
          rejectIndex: lastRejectIndex,
        })
      },
    },
    ],
  }

  componentDidMount () {
    const { transportId } = this.props.location.query
    const noPassItems = this.getNoPassItems().items

    this.props.detailTransports({ transportId })
      .then(() => {
        this.setState({
          ready: true,
          ...noPassItems,
        })
      })
  }

  verifyStatusChange = val => {
    if (val === '??????') {
      this.setState({
        verifyStatus: 1,
      })
    } else {
      this.setState({
        verifyStatus: 0,
      })
    }
  }

  renderVerifyBox = verifyStatus => {
    const { rejectIndex, deliveryPointItem, pointItem } = this.state
    if (!verifyStatus) {
      return (
        <MobileForm
          entity={{ verifyReason: pointItem?.[rejectIndex]?.verifyReason }}
          schema={this.schema}
          mode={FORM_MODE.ADD}
        >
          <FormItem fields='verifyReason' />
          <WhiteSpace size='lg' />
          <FormButton debounce action='next' />
          <FormButton debounce action='last' />
          <FormButton debounce action='submit' />
        </MobileForm>
      )
    }
    return (
      <MobileForm schema={this.schema} mode={FORM_MODE.ADD}>
        <FormButton debounce action='next' />
        <FormButton debounce action='last' />
        <FormButton debounce action='submit' />
      </MobileForm>
    )
  }

  openImageview = (imagelist, index) => {
    this.setState({
      isOpen: true,
      imagelist: imagelist.map(item => item.picture),
      index,
    })
  }

  onClose = () => {
    this.setState({
      isOpen: false,
    })
  }

  filterNoPassDelivery = (deliveryItems) => {
    const { consignmentRejectStatus, shipmentRejectStatus, logisticsBusinessTypeEntity } = this.props.transport

    let backArray = []
    if (logisticsBusinessTypeEntity?.transportBill.indexOf('1') !== -1) {
      if (this.organizationType === 5 && (shipmentRejectStatus === 1 || shipmentRejectStatus === 3)) {
        backArray = deliveryItems.filter(item => item.auditStatus === 0)
      } else if (this.organizationType === 4 && (consignmentRejectStatus === 1 || consignmentRejectStatus === 3)) {
        backArray = deliveryItems.filter(item => item.auditStatus === 0)
      } else if ((this.organizationType === 4 && consignmentRejectStatus === 0) || (this.organizationType === 5 && shipmentRejectStatus === 0)) {
        backArray = deliveryItems
      }
    }
    return backArray
  }

  /*
* ?????????????????????
* shipmentReceiptStatus  ??????????????????  0????????????1????????????2??????????????????3????????????
* shipmentRejectStatus   ??????????????????  0????????????1 ???????????????????????????2???????????????????????????3?????????????????????????????????????????????
*
* ???????????????????????????0 ??? ????????????
* ??????????????????????????????0???1???????????????????????????????????????????????????additionalTypeAll???????????????????????????
* */

  filterNoPassSignItem = (signItems) => {
    if (signItems.length) {
      const {
        consignmentRejectStatus,
        shipmentRejectStatus,
        logisticsBusinessTypeEntity,
      } = this.props.transport
      let backArray = []

      if (logisticsBusinessTypeEntity?.transportBill.indexOf('3') !== -1) {
        if (this.organizationType === 5) {
          if (shipmentRejectStatus === 0) {
            backArray = JSON.parse(JSON.stringify(signItems))
            backArray[0].type = 'receiving'
          }
          if (shipmentRejectStatus === 2 || shipmentRejectStatus === 3) {
            if (signItems[0].additionalTypeAll && signItems[0].additionalTypeAll.indexOf('1') !== -1) {
              backArray = JSON.parse(JSON.stringify(signItems))
              backArray[0].type = 'receiving'
            }
          }
        }

        if (this.organizationType === 4) {
          if (consignmentRejectStatus === 0) {
            backArray = JSON.parse(JSON.stringify(signItems))
            backArray[0].type = 'receiving'
          }
          if (consignmentRejectStatus === 2 || consignmentRejectStatus === 3) {
            if (signItems[0].additionalTypeAll && signItems[0].additionalTypeAll.indexOf('1') !== -1) {
              backArray = JSON.parse(JSON.stringify(signItems))
              backArray[0].type = 'receiving'
            }
          }
        }
      }

      return backArray
    }
    return []
  }


  filterNoPassWeighItem = (signItems) => {
    if (signItems.length) {
      const {
        consignmentRejectStatus,
        shipmentRejectStatus,
        logisticsBusinessTypeEntity,
      } = this.props.transport
      let backArray = []

      if (logisticsBusinessTypeEntity?.transportBill.indexOf('2') !== -1) {
        if (this.organizationType === 5) {
          if (shipmentRejectStatus === 0) {
            backArray = JSON.parse(JSON.stringify(signItems))
            backArray[0].type = 'weigh'
          }
          if (shipmentRejectStatus === 2 || shipmentRejectStatus === 3) {
            if (signItems[0].additionalTypeAll && signItems[0].additionalTypeAll.indexOf('2') !== -1) {
              backArray = JSON.parse(JSON.stringify(signItems))
              backArray[0].type = 'weigh'
            }
          }
        }

        if (this.organizationType === 4) {
          if (consignmentRejectStatus === 0) {
            backArray = JSON.parse(JSON.stringify(signItems))
            backArray[0].type = 'weigh'
          }
          if (consignmentRejectStatus === 2 || consignmentRejectStatus === 3) {
            if (signItems[0].additionalTypeAll && signItems[0].additionalTypeAll.indexOf('2') !== -1) {
              backArray = JSON.parse(JSON.stringify(signItems))
              backArray[0].type = 'weigh'
            }
          }
        }
      }

      return backArray
    }
    return []

  }

  renderPic = () => {
    const { rejectIndex, ready } = this.state
    if (ready) {
      const nodeArr = this.getNoPassItems().arr
      const node = nodeArr[rejectIndex]

      let totalPicture
      switch (node.type) {
        case 'weigh': {
          totalPicture = node.weighDentryid?.split(',')
            .map((billDentry, index, array) => ({
              type: node.type ? node.type : 'delivery',
              weighNumber: node.weighNumber,
              weighDentryid: node.weighDentryid,
              nodeIndex: `${index + 1}/${array.length}`,
              picture: getOssImg(billDentry, { width: 500, height: 500 }),
            }))
          break
        }
        case 'receiving': {
          totalPicture = node.billDentryid?.split(',')
            .map((billDentry, index, array) => ({
              type: node.type ? node.type : 'delivery',
              categoryName: node.categoryName,
              goodsName: node.goodsName,
              deliveryNum: node.deliveryNum,
              goodsUnitCN: node.goodsUnitCN,
              billNumber: node.billNumber,
              receivingNum: node.receivingNum,
              nodeIndex: `${index + 1}/${array.length}`,
              picture: getOssImg(billDentry, { width: 500, height: 500 }),
            }))
          break
        }
        default: {
          totalPicture = node.billDentryid?.split(',')
            .map((billDentry, index, array) => ({
              type: node.type ? node.type : 'delivery',
              categoryName: node.categoryName,
              goodsName: node.goodsName,
              deliveryNum: node.deliveryNum,
              goodsUnitCN: node.goodsUnitCN,
              billNumber: node.billNumber,
              receivingNum: node.receivingNum,
              nodeIndex: `${index + 1}/${array.length}`,
              picture: getOssImg(billDentry, { width: 500, height: 500 }),
            }))
          break
        }
      }

      return totalPicture || []
    }
    return []

  }

  renderAttachMessage = (val) => {
    const { noPassdeliveryItems } = this.state
    let content
    switch (val.type) {
      case 'delivery': {
        content =
          <>
            <span style={{ textAlign: 'left' }}>?????????{val.nodeIndex}</span>
            <span
              style={{ marginLeft: '10px' }}
            >{`${val.categoryName}-${val.goodsName}??????:${val.deliveryNum}${val.goodsUnitCN}`}
            </span>
          </>
        break
      }
      case 'weigh' : {
        content =
          <>
            <span style={{ textAlign: 'left' }}>?????????{val.nodeIndex}</span>
            <span style={{ marginLeft: '10px' }}>???????????????{val.weighNumber}</span>
          </>
        break
      }
      case 'receiving': {
        content =
          <>
            <span style={{ textAlign: 'left' }}>?????????{val.nodeIndex}</span>
            <ul>
              <li>{`???????????????${val.billNumber}`}</li>
              {noPassdeliveryItems.map((item, _index) => <li
                key={_index}
              >{`${item.categoryName}-${item.goodsName}??????:${item.receivingNum}${item.goodsUnitCN}`}
              </li>)}
            </ul>
          </>
        break
      }
      default:
        return null
    }
    return content

  }

  render () {
    // TODO ?????????????????????????????????
    const { verifyStatus, ready, rejectIndex, deliveryPointItem, isOpen, imagelist, index } = this.state
    const pictures = this.renderPic()
    return (
      <>
        {ready &&
        <Carousel
          autoplay={false}
          infinite
          style={{ overflow: 'hidden', height: '400px' }}
        >
          {pictures.map((val, index) => (
            <>
              <div key={index} onClick={() => this.openImageview(pictures, index)} style={{ position: 'relative' }}>
                <img
                  src={`${val.picture}`}
                  alt={`${val.picture}`}
                  style={{ width: '100%', height: '400px', verticalAlign: 'top' }}
                  onLoad={() => {
                    window.dispatchEvent(new Event('resize'))
                  }}
                />
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  color: '#CCCCCC',
                  backgroundColor: 'rgba(0, 0, 0, 0.498039215686275)',
                  top: '0px',
                }}
                >
                  {this.renderAttachMessage(val)}
                </div>
              </div>

            </>
          ))}
        </Carousel>}
        <WhiteSpace size='lg' />
        <SegmentedControl
          selectedIndex={deliveryPointItem?.[rejectIndex]?.verifyStatus || verifyStatus}
          onValueChange={this.verifyStatusChange}
          values={['??????', '??????']}
        />
        <WhiteSpace size='lg' />
        {this.renderVerifyBox(verifyStatus)}
        {isOpen && <WxImageViewer onClose={this.onClose} urls={imagelist} index={index} />}
      </>
    )
  }
}
