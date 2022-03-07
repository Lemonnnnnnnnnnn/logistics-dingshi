import React from 'react';
import CSSModules from 'react-css-modules';
import { formatMoney } from '../../../../utils/utils';
import styles from '../PaymentBill.less';

export default CSSModules(styles, { allowMultiple: true })((props) => {
  const { totalData, renderState: { display, id } } = props;
  let renderConfig;
  switch (id) {
    case 'transportCost':
      renderConfig = {
        type: '总运费(元)',
        total: formatMoney((Number(totalData.waitTotalFreight) + Number(totalData.payedTotalFreight)).toFixed(2)._toFixed(2)),
        unPay: formatMoney(totalData.waitTotalFreight.toFixed(2)._toFixed(2)),
        paid: formatMoney(totalData.payedTotalFreight.toFixed(2)._toFixed(2)),
        index: 0
      };
      break;
    case 'serviceCharge':
      renderConfig = {
        type: '服务费(元)',
        total: formatMoney((Number(totalData.waitServiceCharge) + Number(totalData.payedServiceCharge)).toFixed(2)._toFixed(2)),
        unPay: formatMoney(totalData.waitServiceCharge.toFixed(2)._toFixed(2)),
        paid: formatMoney(totalData.payedServiceCharge.toFixed(2)._toFixed(2)),
        index: 1
      };
      break;
    default: renderConfig = {
      type: '应付金额(元)',
      total: formatMoney((Number(totalData.waitReceivables) + Number(totalData.payedReceivables) + Number(totalData.otherExpensesToBePaid) + Number(totalData.otherExpensesPaid)).toFixed(2)._toFixed(2)),
      unPay: formatMoney((Number(totalData.waitReceivables) + Number(totalData.otherExpensesToBePaid)).toFixed(2)._toFixed(2)),
      paid: formatMoney((Number(totalData.payedReceivables) + Number(totalData.otherExpensesPaid)).toFixed(2)._toFixed(2)),
      index: 2
    };
  }

  const isDisplay = (text) => display? text: '*****';

  const { type, total, unPay, paid, index } = renderConfig;
  return (
    <div styleName='cardDiv'>
      <div>
        {
          display?
            <svg onClick={() => props.changeDisplay(index)} styleName='eye' t="1588489995304" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5556" width="24" height="24">
              <path d="M512 832c-204.8 0-387.2-121.6-470.4-307.2-3.2-9.6-3.2-16 0-25.6C124.8 313.6 307.2 192 512 192s387.2 121.6 470.4 307.2c3.2 9.6 3.2 16 0 25.6C899.2 710.4 716.8 832 512 832zM108.8 512c73.6 156.8 230.4 256 403.2 256s329.6-99.2 403.2-256c-73.6-156.8-230.4-256-403.2-256S182.4 355.2 108.8 512zM512 672c-89.6 0-160-70.4-160-160s70.4-160 160-160 160 70.4 160 160-70.4 160-160 160z m0-256c-54.4 0-96 41.6-96 96s41.6 96 96 96 96-41.6 96-96-41.6-96-96-96z" p-id="5557" fill="#bfbfbf" />
            </svg>
            :
            <>
              <svg styleName='bar' version="1.1" width="20px" height="20px" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1 0 0 1 -573 -189 )">
                  <path d="M 573 189.5  L 597 189.5  " strokeWidth="1" stroke="#999999" fill="none" />
                </g>
              </svg>
              <svg onClick={() => props.changeDisplay(index)} styleName='eye' t="1588489995304" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5556" width="24" height="24">
                <path d="M512 832c-204.8 0-387.2-121.6-470.4-307.2-3.2-9.6-3.2-16 0-25.6C124.8 313.6 307.2 192 512 192s387.2 121.6 470.4 307.2c3.2 9.6 3.2 16 0 25.6C899.2 710.4 716.8 832 512 832zM108.8 512c73.6 156.8 230.4 256 403.2 256s329.6-99.2 403.2-256c-73.6-156.8-230.4-256-403.2-256S182.4 355.2 108.8 512zM512 672c-89.6 0-160-70.4-160-160s70.4-160 160-160 160 70.4 160 160-70.4 160-160 160z m0-256c-54.4 0-96 41.6-96 96s41.6 96 96 96 96-41.6 96-96-41.6-96-96-96z" p-id="5557" fill="#bfbfbf" />
              </svg>
            </>

        }
        <p styleName='number'>{isDisplay(total)}</p>
        <p styleName='des'>{type}</p>
        <div styleName='description'>
          <span>待支付
            <span styleName='money'>{isDisplay(unPay)}</span>
          </span>
          <i styleName='bar2'>|</i>
          <span>已支付
            <span styleName='money'>{isDisplay(paid)}</span>
          </span>
        </div>
      </div>
    </div>
  );
});
