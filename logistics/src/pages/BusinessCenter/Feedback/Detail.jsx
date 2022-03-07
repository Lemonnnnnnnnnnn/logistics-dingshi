import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { Button, Row, Col, Input, message } from 'antd';
import { connect } from 'dva';
import { getOssImg, trim } from '../../../utils/utils';
import { getFeedbackDetail, patchReplyFeedback } from '../../../services/feedbackService';
import UploadFile from '../../../components/Upload/UploadFile';
import PopUpImg from '../../../components/PopUpImg/PopUpImg';

import styles from './Detail.less';


const { TextArea } = Input;
const Details = ({ history, location, deleteTab, commonStore, tabs, activeKey  } ) => {
  const [currentInfo, setCurrentInfo] = useState({});
  const [value, setValue] = useState('');

  useEffect(() => {
    getFeedbackDetail(location.query && location.query.pageKey).then(res => {
      setCurrentInfo({ ...res });
    });
  }, [location]);

  const onChange = useCallback((e) => {
    setValue(e.target.value);
  }, [value]);
  const onSave = useCallback(() => {
    if (!trim(value)) {
      return message.error('请先输入回复内容！');
    }
    patchReplyFeedback(location.query && location.query.pageKey, { feedbackReplyContent: value }).then(res => {
      message.success('回复成功');
      const dele = tabs.find(item => item.id === activeKey);
      deleteTab(commonStore, { id: dele.id });
      history.push('/buiness-center/feedback');
    });
  }, [value]);
  return (
    <div className={styles.detailList}>
      <div className={styles.detailInfo}>
        <Row>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>编号:</span><span>{currentInfo.feedbackNumber || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>反馈端口:</span><span>{currentInfo.feedbackPortStr || '-'}</span>
            </div>
          </Col>
          <Col span={8}>
            <div className={styles.detailInfoItem}>
              <span>状态:</span><span>{currentInfo.feedbackStatusStr}</span>
            </div>
          </Col>
        </Row>
        <div className={styles.addListItem}><span>意见</span></div>
        <Row>
          <Col span={6}>
            <div className={styles.detailInfoItem}>
              <span>反馈用户:</span><span>{currentInfo.feedbackName || '-'}</span>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles.detailInfoItem}>
              <span>联系方式:</span><span>{currentInfo.feedbackPhone || '-'}</span>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles.detailInfoItem}>
              <span>提交时间:</span><span>{currentInfo.createTime ? moment(currentInfo.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
            </div>
          </Col>
          <Col span={6}>
            <div className={styles.detailInfoItem}>
              <span>问题类型:</span><span>{currentInfo.feedbackTypeStr || '-'}</span>
            </div>
          </Col>
        </Row>
        <div className={styles.content}>
          <div>问题详情:</div>
          <p>{currentInfo.feedbackContent}</p>
        </div>
        <div className={styles.content}>
          <div>附件:</div>
          <div>
            {
              currentInfo.feedbackDentryid && currentInfo.feedbackDentryid.split(',').map(item => (
                <UploadFile value={item} readOnly />
              ))
            }
            {
              currentInfo.feedbackDentryidVideo && (
                <div style={{ width: '300px' }}>
                  <PopUpImg type="typeKey" src={getOssImg(currentInfo.feedbackDentryidVideo)} video />
                </div>
              )
            }
          </div>
        </div>
      </div>
      <div className={styles.addListItem}><span>回复</span></div>
      <Row>
        <Col span={6}>
          <div className={styles.detailInfoItem}>
            <span>回复人员:</span><span>{currentInfo.feedbackReplyName}</span>
          </div>
        </Col>
        <Col span={6}>
          <div className={styles.detailInfoItem}>
            <span>回复日期:</span><span>{currentInfo.feedbackReplyTime ? moment(currentInfo.feedbackReplyTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          </div>
        </Col>
      </Row>
      {
        location.pathname.includes('reply') ? (
          <div className={styles.content}>
            <div>回复内容:</div>
            <TextArea rows={5} value={value} onChange={onChange} />
          </div>
        ) : (
          <div className={styles.content}>
            <div>回复内容:</div>
            <p>{currentInfo.feedbackReplyContent}</p>
          </div>
        )}
      <div className={styles.btn}>
        {
          location.pathname.includes('reply') && (
            <Button
              type="primary"
              onClick={onSave}
            >
              保存
            </Button>
          )}
        <Button
          onClick={() => {
            history.push('/buiness-center/feedback');
            const dele = tabs.find(item => item.id === activeKey);
            deleteTab(commonStore, { id: dele.id });
          }}
        >
          返回
        </Button>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  deleteTab: (store, payload) => dispatch({ type: 'commonStore/deleteTab', store, payload }),
});
export default connect(({ commonStore }) => ({
  ...commonStore,
}), mapDispatchToProps)(Details);
