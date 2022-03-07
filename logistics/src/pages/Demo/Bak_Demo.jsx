import React, { Component } from 'react';
import { Tag, Button, Icon, Modal } from 'antd'
import CSSModules from 'react-css-modules';
import { findIndex } from 'lodash'
import styles from './Demo.less'

@CSSModules(styles, { allowMultiple:true })
class Demo extends Component {

  constructor (props) {
    super(props);
    this.state = {
      visible:true,
      deleteArray:[],
      originArray:[
        {
          id: 1,
          word:'状态',
          color:'magenta'
        },

        {
          id: 2,
          word:'运单号',
          color:'red'
        },
        {
          id: 3,
          word:'合同名称',
          color:'volcano'
        },

        {
          id: 4,
          word:'发布日期',
          color:'orange'
        },
        {
          id: 5,
          word:'车牌号',
          color:'gold'
        },
        {
          id: 6,
          word:'装车时间',
          color:'lime'
        },
        {
          id: 7,
          word:'签收时间',
          color:'green'
        },
        {
          id: 8,
          word:'计划量',
          color:'cyan'
        },
        {
          id: 9,
          word:'实提量',
          color:'blue'
        },
        {
          id: 10,
          word:'实收量',
          color:'geekblue'
        },
        {
          id: 11,
          word:'运输时长',
          color:'purple'
        },
        {
          id: 12,
          word:'预计到达时间',
        },
        {
          id: 13,
          word:'托运方',
        },
        {
          id: 14,
          word:'承运方',
        },
        {
          id: 15,
          word:'提货点',
        },
        {
          id: 16,
          word:'货品名称',
        },
        {
          id: 17,
          word:'卸货点',
        },
        {
          id: 18,
          word:'签收单号',
        },
        {
          id: 19,
          word:'司机',
        },
        {
          id: 20,
          word:'联系电话',
        },
      ],
      dataArray: [
        {
          id: 1,
          word:'状态',
          color:'magenta'
        },

        {
          id: 2,
          word:'运单号',
          color:'red'
        },
        {
          id: 3,
          word:'合同名称',
          color:'volcano'
        },

        {
          id: 4,
          word:'发布日期',
          color:'orange'
        },
        {
          id: 5,
          word:'车牌号',
          color:'gold'
        },
        {
          id: 6,
          word:'装车时间',
          color:'lime'
        },
        {
          id: 7,
          word:'签收时间',
          color:'green'
        },
        {
          id: 8,
          word:'计划量',
          color:'cyan'
        },
        {
          id: 9,
          word:'实提量',
          color:'blue'
        },
        {
          id: 10,
          word:'实收量',
          color:'geekblue'
        },
        {
          id: 11,
          word:'运输时长',
          color:'purple'
        },
        {
          id: 12,
          word:'预计到达时间',
        },
        {
          id: 13,
          word:'托运方',
        },
        {
          id: 14,
          word:'承运方',
        },
        {
          id: 15,
          word:'提货点',
        },
        {
          id: 16,
          word:'货品名称',
        },
        {
          id: 17,
          word:'卸货点',
        },
        {
          id: 18,
          word:'签收单号',
        },
        {
          id: 19,
          word:'司机',
        },
        {
          id: 20,
          word:'联系电话',
        },
      ],
      dragElement: null
    };
  }

  componentDidMount () {
    document.addEventListener('dragover', this.preventDefault);
    document.addEventListener('drop', this.preventDefault);
  }

  componentWillUnmount () {
    document.removeEventListener('dragover', this.preventDefault);
    document.removeEventListener('drop', this.preventDefault);
  }

  sortableCard = (sortableInfo) => {
    const { id, word } = sortableInfo;
    const { dataArray, dragElement } = this.state
    return (
      <div
        key={id}
        draggable
        style={{ marginTop:"8px" }}
        onDragStart={() => {
          this.setState({
            dragElement: sortableInfo,
          });
        }}
        onDragEnd={(e) => {
          e.preventDefault();
        }}
        onDragEnter={() => {
          if (id !== dragElement.id) {
            const oldDragIndex = _.findIndex(dataArray, item => item.id === dragElement.id);
            const oldEnterIndex = _.findIndex(dataArray, item => item.id === sortableInfo.id);
            if (oldDragIndex > oldEnterIndex) {
              const newDataArray= dataArray.filter(item => item.id !== dragElement.id);
              const insertIndex = _.findIndex(newDataArray, item => item.id === sortableInfo.id);
              newDataArray.splice(insertIndex, 0, dragElement);
              this.setState({ dataArray: newDataArray });
            } else {
              const newDataArray = dataArray.filter(item => item.id !== dragElement.id);
              const insertIndex = _.findIndex(newDataArray, item => item.id === sortableInfo.id) + 1;
              newDataArray.splice(insertIndex, 0, dragElement);
              this.setState({ dataArray: newDataArray });
            }
          }
        }}
        onDragLeave={() => {
          if (sortableInfo.id !== dragElement.id) {
            if (sortableInfo.id === dataArray[dataArray.length - 1]) {
              const newDataArray = dataArray.filter(item => item.id !== dragElement.id);
              newDataArray.push(dragElement);
              this.setState({
                dataArray: newDataArray,
              });
            }
          }
        }}
      >
        <Tag
          // color={color}
          closable
          style={{ width:'150px' }}
          onClose={() => {
            const { dataArray, deleteArray } = this.state
            const index = dataArray.findIndex(item =>item.id === id)
            dataArray.splice(index, 1)
            this.setState({
              dataArray,
              deleteArray:[...deleteArray, sortableInfo]
            });
          }}
        >
          {`${word}`}
        </Tag>
      </div>
    );
  }

  addArray = field => {
    const { dataArray, deleteArray } = this.state
    const index = deleteArray.findIndex(item =>item.id === field.id)
    deleteArray.splice(index, 1)
    this.setState({
      deleteArray,
      dataArray:[...dataArray, field]
    });
  }

  handleCancel = () => {
    const { originArray } = this.state
    this.setState({
      deleteArray:[],
      dataArray:JSON.parse(JSON.stringify(originArray))
    })
  }

  render () {
    const { dataArray, deleteArray, visible } = this.state
    return (
      <>
        <Modal
          centered
          destroyOnClose
          maskClosable={false}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <div style={{ display: "inline-block", width: "200px", textAlign: 'center', verticalAlign: 'top' }}>
            <div>已选字段</div>
            <div styleName="container">
              {dataArray.map(item => this.sortableCard(item))}
            </div>
          </div>
          <div style={{ display: "inline-block", width: "200px", textAlign: 'center', verticalAlign: 'top' }}>
            <div>去除字段</div>
            <div styleName="container">
              {deleteArray.map(item => (
                <div key={item.id} style={{ marginTop: "8px" }}>
                  <Tag style={{ width:'150px' }}>
                    {item.word}
                    <Icon onClick={() => this.addArray(item)} type="plus" style={{ color: "rgba(0, 0, 0, 0.45)", fontSize:"12px", marginLeft:"3px" }} />
                  </Tag>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right", marginTop:"15px" }}>
            <Button onClick={() => console.log(dataArray)}>添加模板</Button>
          </div>
        </Modal>
      </>
    );
  }
}

export default Demo;
