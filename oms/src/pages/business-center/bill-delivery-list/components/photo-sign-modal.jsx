import React from 'react';
import { Modal, message, Form } from 'antd';
import UploadFile from '../../../../components/upload/upload-file';
import { signTangibleBill } from '../../../../services/billDeliveryService';
import styles from './modal.less';

const  PhotoSignModal = ({ signObj, setSignObj, form, getData }) => {
  const onOk = () => {
    form.validateFields((err, values) => {
      if (values.signPhoto) {
        signTangibleBill(signObj.tangibleBillId, values.signPhoto[0]).then(() => {
          message.success('代签成功!');
          getData();
        });
        setSignObj({ ...signObj, signVisible: false });
      } else {
        message.info('请上传图片！');
      }
    });
  };

  return (
    <Modal
      title="拍照代签"
      centered
      visible={signObj.signVisible}
      onOk={onOk}
      onCancel={() => setSignObj({ ...signObj, signVisible: false })}
      width={750}
      okText="确认"
    >
      <div className={styles.formItem}>
        <span>实体单据交接方：</span>
        {signObj.tangibleBillNo}
      </div>
      <div className={styles.formItem}>
        <span>请上传签收照片：</span>
        {form.getFieldDecorator('signPhoto', {
          rules: [{ required: true, message: '请上传签收照片' }],
        })(
          <UploadFile
            renderMode='photo'
            showOther
            fileSuffix={['jpeg', 'jpg', 'png', 'gif']}
            size={10 * 1024}
            labelUpload='上传附件(小于10MB)'
          />
        )}
        <span>（支持 JPG、GIF、PNG格式）</span>
      </div>
    </Modal>
  );
};

export default Form.create()(PhotoSignModal);
