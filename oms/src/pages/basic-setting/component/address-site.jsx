import React, { useState, useEffect } from 'react';

import { Row, InputNumber } from 'antd';

const AddressSite = ({ value, onChange }) => {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  useEffect(() => {
    setLatitude(value?.latitude || 0);
    setLongitude(value?.longitude || 0);
  }, [value]);

  const changeLatitude = (val) => {
    setLatitude(val);
    onChange({ latitude: val, longitude });
  };

  const changeLongitude = (val) => {
    setLongitude(val);
    onChange({ longitude: val, latitude });
  };

  return (
    <Row type='flex' align="middle">
      <span>经度：</span>
      <InputNumber value={longitude} onChange={changeLongitude} />
      <span className='ml-2'>纬度：</span>
      <InputNumber value={latitude} onChange={changeLatitude} />
    </Row>
  );
};

export default AddressSite;