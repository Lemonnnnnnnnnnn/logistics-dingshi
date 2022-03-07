import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { getUserInfo } from '../../services/user';
import { OWNER, PLATFORM, SHIPMENT, CARGOES } from '../../constants/organization/organization-type';
import IndexPagePlatform from './index-page-platform';
import { getBanner } from '../../services/apiService';
import { xmlStr2json, flattenDeep } from '../../utils/utils';
import IndexPageOwnerAndShipment from './index-page-owner-and-shipment';

const Index = () => {
  const { organizationType } = getUserInfo();
  const [visible, setVisible] = useState(false);
  const [modalObj, setModalObj] = useState({ title: '', content: '' });
  const PageComponent = {
    [PLATFORM]: IndexPagePlatform,
    [OWNER]: IndexPageOwnerAndShipment,
    [SHIPMENT]: IndexPageOwnerAndShipment,
    [CARGOES]: IndexPageOwnerAndShipment,
  }[organizationType];
  useEffect(() => {
    if ((!localStorage.getItem('oms-showHomeModal') || localStorage.getItem('oms-showHomeModal') !== '0') && organizationType === 4) {
      getBanner('login-tip-cargo').then((response) => {
        const obj = xmlStr2json(response).rss ? xmlStr2json(response).rss.channel : { item: [] };
        const article = flattenDeep([obj.item]);
        const latestItem = article.find(item => flattenDeep([item.category]).some(_item => _item.indexOf('visible') !== -1));

        if (latestItem) {
          setVisible(true);
          localStorage.setItem('oms-showHomeModal', '1');
          setModalObj({ title: latestItem.title, content: latestItem['content:encoded'] });
        }
      });
    }
  }, []);
  const handleOk = () => {
    setVisible(false);
    localStorage.setItem('oms-showHomeModal', '0');

  };
  return (
    <>
      <PageComponent organizationType={organizationType} />
      <Modal title='系统提示' visible={visible} onOk={handleOk} footer={null} width={800} centered height={400}
             closable={false}>
        <div style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ textAlign: 'center', height: '60px', letterSpacing: '2px' }}>{modalObj.title}</h1>
          <p style={{ padding: ' 20px', flex: 1, overflowY: 'scroll' }}
             dangerouslySetInnerHTML={{ __html: modalObj.content }} />
          <div style={{ textAlign: 'center', height: '60px' }}>
            <Button type='primary' onClick={handleOk}>我已知晓</Button>
          </div>
        </div>

      </Modal>
    </>
  );
};
export default Index;
