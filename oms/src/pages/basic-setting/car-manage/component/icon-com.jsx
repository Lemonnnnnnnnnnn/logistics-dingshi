import React from 'react';
import { Button, message, Popover } from 'antd';
import { patchCarGroups } from '../../../../services/apiService';

export default class Index extends React.Component {
  state = {
    clicked: false,
  };

  hide = () => {
    this.setState({
      clicked: false,
    });
  };

  handleClickChange = visible => {
    this.setState({
      clicked: visible,
    });
  };

  confirm = () => {
    patchCarGroups({ isEffect: 0, carGroupId: this.props.carGroupId }).then(() => {
      this.hide();
      message.success('删除成功');
      this.props.refresh();
    });
  }

  modifyCarInGroup = () => {
    const { carId } = this.props;
    this.props.modifyCarInGroup(carId);
    this.hide();
  }

  render () {
    const { type } = this.props;
    if (type==='groupClose') {
      return (
        <>
          <Popover
            placement="top"
            visible={this.state.clicked}
            onVisibleChange={this.handleClickChange}
            content={
              <>
                <p>{this.props.title}</p>
                <div>
                  <Button onClick={this.hide} size='small'>取消</Button>
                  <Button style={{ marginLeft: '15px' }} size='small' type='primary' onClick={this.confirm}>确定</Button>
                </div>
              </>
            }
            trigger="click"
          >
            {this.props.renderComponent}
          </Popover>
        </>
      );
    }
    if (type==='carClose') {
      return (
        <>
          <Popover
            placement="top"
            visible={this.state.clicked}
            onVisibleChange={this.handleClickChange}
            content={
              <>
                <p>{this.props.title}</p>
                <div>
                  <Button onClick={this.hide} size='small'>取消</Button>
                  <Button style={{ marginLeft: '15px' }} size='small' type='primary' onClick={this.modifyCarInGroup}>确定</Button>
                </div>
              </>
            }
            trigger="click"
          >
            {this.props.renderComponent}
          </Popover>
        </>
      );
    }
    return '';
  }
}
