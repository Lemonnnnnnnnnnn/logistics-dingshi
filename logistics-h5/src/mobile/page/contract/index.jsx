import React, { Component } from 'react';
import { Input, Button, Row, Col } from 'antd';
import { getOssImg } from '@/utils/utils';

class Index extends Component {
  state = {
    value: '',
    showImg: false,
    imgUrl: '',
  };

  handleConfirm = () => {
    const { value } = this.state;
    const url = `contract/${value}.png`;
    const imgUrl = getOssImg(url);
    this.setState({ imgUrl, showImg: true });
  };

  handleChangeValue = (e) => {
    this.setState({ value: e.target.value });
  };

  render () {
    const { showImg, imgUrl } = this.state;
    return (
      <div style={{ padding: '3rem' }}>
        <Row type='flex' justify='center'>
          <Col><Input placeholder='请输入合同码' onChange={this.handleChangeValue} /></Col>
          <Col><Button type='primary' style={{ marginLeft: '6px' }} onClick={this.handleConfirm}>确定</Button></Col>
        </Row>
        {showImg && <img style={{ width: '100%', margin: '10px 0 10px 0' }} src={imgUrl} alt='合同图片' />}
      </div>
    );
  }
}

export default Index;

