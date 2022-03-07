import React, { Component } from 'react';
import { Button, Select, message } from 'antd';
import { isFunction } from 'util';
import CSSModules from 'react-css-modules';
import CreateTemplate from './CreateTemplate';
import { patchTemplate } from "@/services/apiService";
import styles from './ExcelOutput.less';

@CSSModules(styles, { allowMultiple: true })
class ExcelOutput extends Component {

  constructor (props) {
    super(props);
    this.templateRef = React.createRef();
    this.state = {
      templateOptions:[],
      templateContent:'',
    };
  }

  componentDidMount () {
    this.getTemplateOptions();
  }

  getTemplateOptions = () =>{
    const { getTemplateList:getTemplate, templateType : _templateType } = this.props;
    if (isFunction(getTemplate)){
      getTemplate({ offset:0, limit:100 })
        .then(data =>{
          const templateList = (data.items || []).filter(({ templateType }) => templateType === _templateType);

          this.setState({
            templateId : undefined,
            templateOptions:templateList.map(({ templateId, templateName, templateContent })=>({ value:templateId, label:templateName, templateContent }))
          });
        });
    }
  }

  selectTemplate = value => {
    const { templateOptions } = this.state;
    const selectTemplate = templateOptions.find(item=>item.value === value) || {};
    const { templateContent } = selectTemplate;
    const { resetTemplate } = this.templateRef.current;
    this.setState({
      templateId:value,
      templateContent,
    }, ()=>resetTemplate());
  }

  exportTable = () => {
    const { templateId } = this.state;
    const { exportExcelAction } = this.props;
    if (!templateId) return message.error('请选择导出模板');
    if (isFunction(exportExcelAction)){
      exportExcelAction(templateId);
    }
  }


  addTemplateToList = newTemplate =>{
    const { templateOptions } = this.state;
    this.setState({
      templateOptions:[...templateOptions, newTemplate]
    });
  }

  handleClick = (e, templateName, templateId) =>{
    const { templateType } = this.props;
    const params = {
      templateId,
      templateType,
      templateName,
      isEffect : 0,
    };
    patchTemplate(params).then(()=>{
      this.getTemplateOptions();
    });
    e.stopPropagation();
  }


  render () {
    const { templateOptions, templateContent, templateId } = this.state;
    const { fieldArray=[], addTemplate, templateType } = this.props;
    return (
      <>
        <div>
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>选择模板：</span>
          <Select
            style={{ width: 200 }}
            placeholder="选择模板"
            onSelect={this.selectTemplate}
            value={templateId}
          >
            {templateOptions.map(item => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
                <a onClick={(e)=>this.handleClick(e, item.label, item.value)} href='#' style={{ float : 'right' }}>删除</a>
              </Select.Option>
            ))}
          </Select>
          <Button style={{ marginLeft: '20px' }} type='primary' onClick={this.exportTable}>导出</Button>
        </div>
        <CreateTemplate ref={this.templateRef} templateType={templateType} getTemplateOptions={this.getTemplateOptions} templateContent={templateContent} fieldArray={fieldArray} addTemplate={addTemplate} addTemplateToList={this.addTemplateToList} />
      </>
    );
  }
}

export default ExcelOutput;
