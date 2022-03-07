import React, { PureComponent } from 'react'
import { Card, Steps } from 'antd'
import styles from './style.less'
import Verify from './Verify'


const { Step } = Steps

const STEP = [
  {
    stepName: 'delivery',
  },
  {
    stepName: 'weigh',
  },
  {
    stepName: 'receiving',
  },
]

export default class StepForm extends PureComponent {

  state = {
    stepName: STEP[0].stepName,
    index: 0,
    hadReceipt: true,
    hadWeigh : true,
    hadDelivery : true
  }

  nextStep = () => {
    const index = this.state.index + 1
    const stepData = STEP[index]
    if (stepData) {
      this.setState({ ...stepData, index })
    }
  }

  preStep = () => {
    const index = this.state.index - 1
    if (index >= 0) {
      const stepData = STEP[index]
      this.setState({ ...stepData, index })
    }
  }

  setHadReceipt = (hadReceipt) => {
    this.setState({
      hadReceipt,
    })
  }

  setHadWeigh = (hadWeigh) => {
    this.setState({
      hadWeigh,
    })
  }

  setHadDelivery = (hadDelivery) => {
    this.setState({
      hadDelivery,
    })
  }

  render() {
    const { children, ...rest } = this.props
    const { index, stepName, hadReceipt, hadWeigh, hadDelivery } = this.state
    const _props = {
      ...rest,
      stepName,
      nextStep: this.nextStep,
      preStep: this.preStep,
    }
    return (
      <Card bordered={false}>
        <Steps current={index} className={styles.steps}>
          {hadDelivery ? <Step title='提货单' /> : null}
          {hadWeigh ? <Step title='过磅单' /> : null}
          {hadReceipt ? <Step title='卸货单' /> : null}
        </Steps>
        <Verify setHadDelivery={this.setHadDelivery} setHadWeigh={this.setHadWeigh} setHadReceipt={this.setHadReceipt} {..._props} />
      </Card>
    )
  }
}
