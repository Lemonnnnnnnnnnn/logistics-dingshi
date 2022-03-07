import React, { Component } from 'react';
import { Button } from 'antd-mobile';
import nativeApi from '@/utils/nativeApi';

class Debugger extends Component {

  state = {
    location:{}
  }

  test = () => {
    const data = {
      aaa:111,
      bbb:[1, 2, 3],
      c: {
        aa:1,
        bb:2,
        cc:[1, 2]
      }
    }
    nativeApi.onSaveLoading(JSON.stringify(data))
      .then((info)=>{
        this.setState({
          location:info
        })
      })
  }

  _test = () => {
    const data = {
      aaa:'sbsb',
      bbb:['jnx', 'nm', 'sl'],
      c: {
        aa:1,
        bb:2,
        cc:[1, 2]
      }
    }
    nativeApi.onSaveSign(JSON.stringify(data))
      .then((info)=>{
        this.setState({
          location:info
        })
      })
  }

  render () {
    return (
      <>
        <div>{JSON.stringify(this.state.location)}</div>
        <Button style={{ marginTop:'20px' }} onClick={this.test}>提货</Button>
        <Button style={{ marginTop:'20px' }} onClick={this._test}>签收</Button>
      </>
    );
  }
}

export default Debugger;
