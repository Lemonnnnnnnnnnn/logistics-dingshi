import React, { Component } from 'react';
import { Select, Modal } from 'antd'
import { getCarGroups } from '@/services/apiService'
import EditCarGroup from '@/pages/basic-setting/car-manage/component/edit-car-group'

const { Option } = Select

class CarGroupField extends Component {

  state = {
    options: [],
    carGroupModal: false
  }

  componentDidMount () {
    const params = { isAvailable: true, offset: 0, limit: 1000 }
    getCarGroups(params)
      .then(data => {
        this.setState({
          options:data.items || []
        })
      })
  }

  nullCarGroup = () => {
    const { options } = this.state
    if (!options.length) {
      this.setState({
        carGroupModal:true
      })
    }
  }

  closeModal = () => {
    const params = { isAvailable: true, offset: 0, limit: 1000 }
    getCarGroups(params)
      .then(data => {
        this.setState({
          options:data.items || [],
          carGroupModal: false
        })
      })
  }

  render () {
    const { options, carGroupModal } = this.state
    const { onChange, value } = this.props
    return (
      <>
        <Modal
          destroyOnClose
          maskClosable={false}
          visible={carGroupModal}
          title='编辑车组'
          width='1050px'
          onCancel={this.closeModal}
          footer={null}
        >
          {carGroupModal && <EditCarGroup />}
          {/* <EditCarGroup needCarGroupId closeModal={this.toggleGroupModal} getCarGroupId={this.hhh} /> */}
        </Modal>
        <Select onChange={onChange} value={value} placeholder='请选择车组' onDropdownVisibleChange={this.nullCarGroup}>
          {options.map(item => (
            <Option value={item.carGroupId}>{item.carGroupName}</Option>
          ))}
        </Select>
      </>
    );
  }
}

export default CarGroupField;
