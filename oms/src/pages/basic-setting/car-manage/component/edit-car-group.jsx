import React from 'react';
import { Input, Button, Icon, message } from 'antd';
import CSSModules from 'react-css-modules';
import styles from './edit-car-group.less';
import { getCarGroups, createCarGroups, patchCarGroups, getCars, detailCarGroups, modifyCarGroups } from '@/services/apiService';
import IconCom from './icon-com';

const { Search } = Input;

@CSSModules(styles, { allowMultiple: true })
export default class OrderHistory extends React.Component {

  state = {
    groups: [],
    carList: [],
    totalCar: []
  }

  componentDidMount () {
    this.refreshGroup();
  }

  setActiveGroup = (e) => {
    const carGroupId = e.target.getAttribute('cargroupid');
    if (!carGroupId || Number(carGroupId) === this.activeCarGroupId) return;
    const { groups } = this.state;
    let activeCarGroupId;
    const newGroups = groups.map(item => {
      item.active = false;
      if (item.carGroupId === Number(carGroupId)) {
        item.active = true;
        activeCarGroupId = item.carGroupId;
      }
      return item;
    });
    detailCarGroups(activeCarGroupId).then(({ carEntities }) => {
      this.setState({
        carList: carEntities
      });
    });
    this.activeCarGroupId = activeCarGroupId;
    this.getTotalCar();
    this.setState({
      groups: newGroups
    });
  }

  renderGroupsList = () => {
    const { groups } = this.state;
    if (!groups || groups.length === 0) return '';
    return (
      <ul styleName='group_item'>
        {
          groups.map(item => (
            <li key={item.carGroupId} styleName={item.active ? 'active' : ''} cargroupid={item.carGroupId} onClick={this.setActiveGroup}>
              {
                item.status === 'edit' ?
                  <>
                    <Input style={{ width: '200px' }} onChange={this.editGroupName} placeholder='请输入车组名称' />
                    <div>
                      <Button style={{ marginLeft: '30px' }} size='small' type='primary' onClick={this.confirmGroupName}>确定</Button>
                      <Button style={{ marginLeft: '15px' }} onClick={() => { this.groupStatus(item.carGroupId, false); }} size='small'>取消</Button>
                    </div>
                  </>
                  :
                  <>
                    {item.carGroupName}
                    <div styleName='icon_div'>
                      <Icon type="form" onClick={(e) => { e.stopPropagation(); this.groupStatus(item.carGroupId, true); }} />
                      <IconCom title='是否删除该车组' type='groupClose' carGroupId={item.carGroupId} refresh={this.refreshGroup} renderComponent={<Icon type="close" />} />
                    </div>
                  </>
              }
            </li>
          ))
        }
      </ul>
    );
  }

  renderHasCarList = () => {
    const { carList } = this.state;
    if (!this.activeCarGroupId) return '暂无车辆';
    if (!carList || carList.length === 0 || !carList[0]) return '该车组暂无车源，请到右侧搜索添加';
    return (
      <ul styleName='car_ul'>
        {carList.map(item => (
          <li key={item.carId}>
            {item.carNo}
            <IconCom title='是否移除该车辆' type='carClose' carId={item.carId} modifyCarInGroup={this.removeCar} renderComponent={<Icon type="close" />} />
          </li>
        ))}
      </ul>
    );
  }

  renderTotalCar = () => {
    const { totalCar } = this.state;
    if (!totalCar || totalCar.length === 0 || !totalCar[0]) return <p style={{ textAlign: 'center', paddingTop: '10px' }}>暂无车辆</p>;
    return (
      <ul styleName='car_ul'>
        {totalCar.map(item => (
          <li key={item.carId}>
            {item.carNo}
            {this.renderButton(item)}
          </li>
        ))}
      </ul>
    );
  }

  renderButton = (item) => {
    switch (item.button) {
      case 1:
        return <IconCom title='是否加入该车辆' type='carClose' carId={item.carId} modifyCarInGroup={this.addCarToGroup} renderComponent={<Button size='small' type='primary' ghost>加入</Button>} />;
      case 2:
        return '';
      default: return <IconCom title='是否移除该车辆' type='carClose' carId={item.carId} modifyCarInGroup={this.removeCar} renderComponent={<Button size='small' type='danger' ghost>移除</Button>} />;
    }
  }

  addCarToGroup = (carId) => {
    const { carList } = this.state;
    const carIdList = [];
    if (carList && carList.length !== 0) {
      carList.forEach(item => {
        carIdList.push(item.carId);
      });
    }
    carIdList.push(carId);
    const params = {
      carGroupId: this.activeCarGroupId,
      carIdList
    };
    modifyCarGroups(params).then(() => {
      message.success('加入成功');
      detailCarGroups(this.activeCarGroupId).then(({ carEntities }) => {
        this.setState({
          carList: carEntities
        });
        this.getTotalCar();
      });
    });
  }

  removeCar = (carId) => {
    const { carList } = this.state;
    let carIdList = [];
    if (carList && carList.length !== 0) {
      carList.forEach(item => {
        carIdList.push(item.carId);
      });
    }
    carIdList = carIdList.filter(current => current !== Number(carId));
    const params = {
      carGroupId: this.activeCarGroupId,
      carIdList
    };
    modifyCarGroups(params).then(() => {
      message.success('移除成功');
      detailCarGroups(this.activeCarGroupId).then(({ carEntities }) => {
        this.setState({
          carList: carEntities
        });
        this.getTotalCar();
      });
    });
  }

  groupStatus = (carGroupId, bool) => {
    const { groups } = this.state;
    const index = groups.findIndex(item => item.carGroupId === carGroupId);
    if (bool) {
      this.editCarGroupId = carGroupId;
      groups[index].status = 'edit';
    } else {
      groups[index].status = 'detail';
    }
    this.setState({
      groups
    });
  }

  editGroupName = (e) => {
    const name = e.target.value.trim();
    this.editGroupName = name;
  }

  confirmGroupName = () => {
    if (!this.editGroupName) return message.error('请先输入车组名称');
    patchCarGroups({
      carGroupId: this.editCarGroupId,
      carGroupName: this.editGroupName
    }).then(() => {
      this.refreshGroup();
      this.groupStatus(this.editCarGroupId, false);
    });
  }

  searchGroup = (value) => {
    this.groupKeyWord = value.trim();
    this.refreshGroup();
  }

  searchCar = (value) => {
    this.carNoKeyWord = value.trim();
    this.getTotalCar();
  }

  getTotalCar = () => {
    const { totalCar } = this.state;
    if (!this.carNoKeyWord) {
      if (totalCar) {
        const { carList } = this.state;
        this.setState({
          totalCar: totalCar.map(item => {
            // 0 移除 1 加入 2隐藏
            item.button = 1;
            if (!this.activeCarGroupId) item.button = 2;
            const index = carList.findIndex(current => current.carId === item.carId);
            if (index !== -1) item.button = 0;
            return item;
          })
        });
      }
      return;
    }
    getCars({ selectType: 2, carNo: this.carNoKeyWord, limit: 1000000, offset: 0 }).then(({ items }) => {
      if (!items || items.length === 0 || !items[0]) return;
      const { carList } = this.state;
      this.setState({
        totalCar: items.map(item => {
          // 0 移除 1 加入 2隐藏
          item.button = 1;
          if (!this.activeCarGroupId) item.button = 2;
          const index = carList.findIndex(current => current.carId === item.carId);
          if (index !== -1) item.button = 0;
          return item;
        })
      });
    });
  }

  groupNameOnchange = (e) => {
    const { value } = e.target;
    this.groupName = value.trim();
  }

  createGroup = () => {
    if (!this.groupName) return message.error('请先输入车组名称');
    if (this.groupName.length > 10) return message.error('车组名称长度不得大于10个字符');
    createCarGroups({ carGroupName: this.groupName }).then(() => {
      this.refreshGroup();
    });
  }

  refreshGroup = () => {
    const params = this.groupKeyWord ? { isAvailable: true, offset: 0, limit: 1000, carGroupName: this.groupKeyWord, isOrderByTime: true } : { isAvailable: true, offset: 0, limit: 1000, isOrderByTime: true };
    getCarGroups(params).then(({ items }) => {
      this.setState({
        groups: items.map((item, index) => {
          item.status = 'detail';
          item.active = index === 0;
          return item;
        })
      });
      if (!items?.[0]?.carGroupId) {
        this.activeCarGroupId = undefined;
        this.setState({
          carList: []
        });
        this.getTotalCar();
        return;
      }
      this.activeCarGroupId = items[0].carGroupId;
      detailCarGroups(items[0].carGroupId).then(({ carEntities }) => {
        this.setState({
          carList: carEntities
        }, () => {
          this.getTotalCar();
        });
      });
    });
  }

  sendCarGroupId = () => {
    this.props.getCarGroupId(this.activeCarGroupId, this.props.closeModal);
  }

  render () {
    return (
      <div styleName='container'>
        <div styleName='items group'>
          <div styleName='header'>
            <span styleName='label'>车组:</span>
            <Search
              placeholder="请输入车组名称"
              onSearch={this.searchGroup}
              onChange={this.groupNameOnchange}
            />
            <Button style={{ marginLeft: '10px' }} type='primary' onClick={this.createGroup}>创建</Button>
          </div>
          {this.renderGroupsList()}
        </div>
        <div styleName='items cars'>
          <h3 styleName='card_title'>已加入车源</h3>
          {this.renderHasCarList()}
        </div>
        <div styleName='items search'>
          <div styleName='header'>
            <span styleName='label'>车牌号:</span>
            <Search
              placeholder="请输入车牌号"
              onSearch={this.searchCar}
            />
          </div>
          {this.renderTotalCar()}
        </div>
        {
          this.props.needCarGroupId?
            <div styleName='btn_box'>
              <Button onClick={this.props.closeModal}>取消</Button>
              <Button onClick={this.sendCarGroupId} type='primary'>确定</Button>
            </div>
            :
            null
        }
      </div>
    );
  }
}
