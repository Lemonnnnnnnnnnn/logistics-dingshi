import React from 'react';
import { Alert, Steps } from 'antd';
import styles from './steps.less';

const { Step } = Steps;
const  BillListSteps = () => (
  <div className={styles.billBeliveryList}>
    <Alert
      message={(
        <div>
          <div className={styles.billDeliveryTitle}>操作步骤:</div>
          <Steps current={-1} percent={100} progressDot>
            <Step title="实体单据交票清单" />
            <Step title="核对数据" description="保证运单数据与实体单据一致" />
            <Step title="核对完毕提交审核" />
            <Step title="审核通过" />
            <Step title="打印交票清单" description="移交实体单据" />
            <Step title="托运方/货权方确认签收" />
          </Steps>
        </div>

      )}
      type="info"
      closable
    />
  </div>
);

export default BillListSteps;
