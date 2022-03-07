import React, { useMemo } from "react";
import { SchemaForm, Item, Observer } from '@gem-mine/antd-schema-form';
import { Button, Row, Col } from 'antd';
import DebounceFormButton from '../../../../components/debounce-form-button';
import { IS_EFFECTIVE_STATUS } from "../../../../constants/project/project";

const CancelTransportModal = (props) =>{
  const { changeTransportStatus, refrash, transportId, onCancel } = props;

  const radioGroup = useMemo(()=>([
    {
      label : '司机不愿意继续派送',
      value : '司机不愿意继续派送',
      key : 0,
    },
    {
      label : '跨项目派单',
      value : '跨项目派单',
      key : 1,
    },
    {
      label : '其他',
      value : '其他',
      key : 2,
    },
  ]), []);


  const schema = useMemo(()=>({
    reason: {
      label : '取消原因',
      component: "radio",
      options: radioGroup,
      rules: {
        required: [true, "请选择取消原因"]
      }
    },
    remark: {
      label : '备注',
      component: "input.textArea",
      placeholder: "选择其他请填写具体原因",
      rules : Observer({
        watch : 'reason',
        action : (reason)=>{
          if (reason === '其他'){
            return { required : [true, '选择其他请填写具体原因'] };
          }
          return { required : false };
        }
      })
    }
  }), []);

  const handleClickConfirm = (formData)=>{
    if (!transportId) return;

    const { reason, remark } = formData;
    let verifyReason = reason;
    if (remark) verifyReason = `${verifyReason}、${remark}`;
    changeTransportStatus({
      transportId,
      iseffectiveStatus: IS_EFFECTIVE_STATUS.IS_EFFECTIVE_DELETE,
      verifyReason,
    })
      .then(() => {
        onCancel();
        refrash();
      });
  };

  return (
    <SchemaForm schema={schema}>
      <div className='mb-2'>该运单司机已接单，请在取消前与司机确认无误，并请选择取消原因：</div>
      <Item field='reason' />
      <Item field='remark' />
      <Row className='mt-2' type='flex' justify='space-around'>
        <Col><Button onClick={onCancel}>取消</Button></Col>
        <Col><DebounceFormButton type='primary' label='确认' onClick={handleClickConfirm} /></Col>
      </Row>
    </SchemaForm>
  );
};

export default CancelTransportModal;
