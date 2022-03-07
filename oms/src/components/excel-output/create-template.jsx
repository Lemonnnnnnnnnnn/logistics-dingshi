import React, { Component } from 'react';
import { Tag, Button, Icon, Input, message } from 'antd';
import { isFunction } from 'util';

class CreateTemplate extends Component {

  constructor (props) {
    super(props);
    this.state = {
      dataArray:JSON.parse(JSON.stringify(props.fieldArray)),
      deleteArray:[],
      dragElement: null,
      templateName:'导出模板',
      refresh: false
    };
  }

  static getDerivedStateFromProps = (props, state) =>{
    if (!props.templateContent) return state;
    // 避免选择模板后导致修改模板功能失效
    if (!state.refresh) return state;

    const addedKey = props.templateContent.split(',');

    const dataArray = addedKey.map(item => props.fieldArray.find(_item => _item.id === item)).filter(item=>item !== undefined);
    const deleteArray = props.fieldArray.filter(item => addedKey.indexOf(item.id)===-1);
    state.dataArray = dataArray;
    state.deleteArray = deleteArray;
    state.refresh = false;
    return state;
  }

  resetTemplate = () =>{
    this.setState({
      refresh: true
    });
  }

  componentDidMount () {
    document.addEventListener('dragover', this.preventDefault);
    document.addEventListener('drop', this.preventDefault);
  }

  componentWillUnmount () {
    document.removeEventListener('dragover', this.preventDefault);
    document.removeEventListener('drop', this.preventDefault);
  }

  addArray = field => {
    const { dataArray, deleteArray } = this.state;
    const index = deleteArray.findIndex(item =>item.id === field.id);
    deleteArray.splice(index, 1);
    this.setState({
      deleteArray,
      dataArray:[...dataArray, field]
    });
  }

  createTemplate = () =>{
    const { dataArray, templateName } = this.state;
    const { addTemplate, addTemplateToList, fieldArray:originArray, templateType } = this.props;
    if (!dataArray.length) return message.error('无法创建无效模板');
    if (!templateName) return message.error('请输入模板名称');
    const templateContent = dataArray.map(item=>item.id).join(',');
    addTemplate({ templateName, templateContent, templateType })
      .then(({ templateId, templateName })=>{
        this.setState({
          dataArray:JSON.parse(JSON.stringify(originArray)),
          deleteArray:[],
          templateName:'导出模板'
        });
        this.props.getTemplateOptions();
        if (isFunction(addTemplateToList)){
          addTemplateToList({ value:templateId, label:templateName });
        }
      });
  }

  changeTemplateName = (e) => {
    const { value } = e.target;
    this.setState({
      templateName:value
    });
  }

  sortableCard = (sortableInfo) => {
    const { id:sortableId, word } = sortableInfo;
    const { dataArray, dragElement } = this.state;
    return (
      <div
        key={sortableId}
        style={{ display: "inline-block", width: "120px", marginTop:'8px' }}
        draggable
        onDragStart={() => {
          this.setState({
            dragElement: sortableInfo,
          });
        }}
        onDragEnd={(e) => {
          e.preventDefault();
        }}
        onDragEnter={() => {
          if (sortableId !== dragElement.id) {
            const oldDragIndex = _.findIndex(dataArray, item => item.id === dragElement.id);
            const oldEnterIndex = _.findIndex(dataArray, item => item.id === sortableId);
            if (oldDragIndex > oldEnterIndex) {
              const newDataArray= dataArray.filter(item => item.id !== dragElement.id);
              const insertIndex = _.findIndex(newDataArray, item => item.id === sortableId);
              newDataArray.splice(insertIndex, 0, dragElement);
              this.setState({ dataArray: newDataArray });
            } else {
              const newDataArray = dataArray.filter(item => item.id !== dragElement.id);
              const insertIndex = _.findIndex(newDataArray, item => item.id === sortableId) + 1;
              newDataArray.splice(insertIndex, 0, dragElement);
              this.setState({ dataArray: newDataArray });
            }
          }
        }}
      >
        <Tag
          // color={color}
          style={{ height:'2.5em', lineHeight:'2.5em' }}
          closable
          onClose={() => {
            const { dataArray, deleteArray } = this.state;
            const index = dataArray.findIndex(item =>item.id === sortableId);
            dataArray.splice(index, 1);
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

  render () {
    const { dataArray, deleteArray, templateName='导出模板' } = this.state;

    return (
      <>
        <div style={{ verticalAlign: 'top', minHeight: "180px", marginTop: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>要导出的字段:</div>
          <div style={{ marginTop: '5px' }}>
            {dataArray.map(item => this.sortableCard(item))}
          </div>
        </div>
        <div style={{ verticalAlign: 'top', marginTop: '20px', minHeight: "180px" }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>已删除的字段:</div>
          <div style={{ marginTop: '5px' }}>
            {deleteArray.map(item => (
              <div key={item.id} style={{ display: "inline-block", width: "120px", marginTop: '8px' }}>
                <Tag style={{ height: '2.5em', lineHeight: '2.5em' }}>
                  {item.word}
                  <Icon onClick={() => this.addArray(item)} type="plus" style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: "12px", marginLeft: "3px" }} />
                </Tag>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right", marginTop: "15px" }}>
          <Input defaultValue='导出模板' value={templateName} maxLength={15} onChange={this.changeTemplateName} style={{ marginRight: '8px', width: '200px' }} />
          <Button type='primary' onClick={this.createTemplate}>保存</Button>
        </div>
      </>
    );
  }
}

export default CreateTemplate;
