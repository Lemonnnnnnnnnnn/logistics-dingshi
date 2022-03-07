import CssModule from 'react-css-modules';
import React from 'react';
import moment from 'moment';
import { DatePicker, Button, Tag, message, Select } from 'antd';
import { cloneDeep } from '../../../../utils/utils';
import styles from './business-data.less';

const { RangePicker } = DatePicker;

const { CheckableTag } = Tag;

const dateFormat = 'YYYY/MM/DD';
const monthFormat = 'YYYY-MM';
const weekFormat = 'GGGG-WW周';

@CssModule(styles, { allowMultiple: true })
export default class SearchBar extends React.Component {
  state = {
    tabs: [
      {
        text: '天',
        checked: true,
      },
      {
        text: '周',
        checked: false,
      },
      {
        text: '月',
        checked: false,
      },
    ],
  };

  defaultTime = {
    createDateStart: moment().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    createDateEnd: moment().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
  };

  componentDidMount() {
    const { autoRequest = true } = this.props;
    if (autoRequest) {
      this.sendRequest();
    }
  }

  sendRequest = () => {
    const { getData } = this.props;
    const newParams = this.getParams();
    const end = moment(newParams.createDateEnd).startOf('day').format('YYYY/MM/DD HH:mm:ss');
    const start = moment(newParams.createDateStart).add(1, 'year').startOf('day').format('YYYY/MM/DD HH:mm:ss');
    const diffDays = moment(end).diff(moment(start), 'days');
    if (diffDays >= 0) return message.error('选择时间跨度不得超过1年');
    getData(newParams);
  };

  getParams = () => {
    const { tabs, projectId } = this.state;
    const { params = {} } = this.props;
    const dateValue = this.formatValue();
    const index = tabs.findIndex(current => current.checked === true);
    const newParams = dateValue ? { ...dateValue, type: index + 1, ...params } : {
      ...this.defaultTime,
      type: index + 1, ...params,
    };
    return { ...newParams, ...{ projectId } };
  };

  handleCheckedChange = index => {
    const { tabs } = this.state;
    tabs.forEach((item) => {
      item.checked = false;
    });
    tabs[index].checked = true;
    this.adjustValue();
    this.setState({ tabs });
  };

  adjustValue = () => {
    const { tabs, value } = this.state;
    if (!value || !value[0]) return;
    const index = tabs.findIndex(current => current.checked === true);
    if (tabs[index].text === '天') {
      value[0] = value[0].startOf('day');
      value[1] = value[1].endOf('day');
    }
    if (tabs[index].text === '周') {
      value[0] = value[0].startOf('week');
      value[1] = value[1].endOf('week');
    }
    if (tabs[index].text === '月') {
      value[0] = value[0].startOf('month');
      value[1] = value[1].endOf('month');
    }
    this.setState({ value });
  };

  getExcel = () => {
    const { getExcel } = this.props;
    const newParams = this.getParams();
    getExcel(newParams);
  };

  renderTabs = () => {
    const { tabs } = this.state;
    const datePick = tabs.map((item, index) => <CheckableTag styleName='tabs' key={item.text} checked={item.checked} onChange={() => this.handleCheckedChange(index)}>{item.text}</CheckableTag>);
    return (
      <div>
        {datePick}
        <Button onClick={this.getExcel}>导出Excel</Button>
      </div>
    );
  };

  formatValue = () => {
    const { value: _value, tabs } = this.state;
    if (!_value || !_value[0]) return null;
    const current = tabs.find(current => current.checked === true);
    const value = cloneDeep(_value);
    let createDateStart;
    let createDateEnd;
    if (current.text === '天') {
      createDateStart = value[0].startOf('day').format('YYYY/MM/DD HH:mm:ss');
      createDateEnd = value[1].endOf('day').format('YYYY/MM/DD HH:mm:ss');
    }
    if (current.text === '周') {
      createDateStart = value[0].startOf('week').format('YYYY/MM/DD HH:mm:ss');
      createDateEnd = value[1].endOf('week').format('YYYY/MM/DD HH:mm:ss');
    }
    if (current.text === '月') {
      createDateStart = value[0].startOf('month').format('YYYY/MM/DD HH:mm:ss');
      createDateEnd = value[1].endOf('month').format('YYYY/MM/DD HH:mm:ss');
    }
    return {
      createDateStart,
      createDateEnd,
    };
  };

  handleChange = value => {
    this.setState({ value }, () => {
      this.adjustValue();
    });
  };

  handlePanelChange = value => {
    this.setState({ value }, () => {
      this.adjustValue();
    });
  };

  renderDatePicker = () => {
    const { tabs, value } = this.state;
    const index = tabs.findIndex(current => current.checked === true);
    let picker;
    switch (index) {
      case 0:
        picker = <RangePicker
          styleName='marginRight15'
          placeholder={['起始日期', '结束日期']}
          disabledDate={this.disabledDate}
          format={dateFormat}
          mode={['date', 'date']}
          value={value}
          onChange={this.handleChange}
        />;
        break;
      case 1:
        picker = <RangePicker
          styleName='marginRight15'
          placeholder={['起始周', '结束周']}
          format={weekFormat}
          mode={['date', 'date']}
          value={value}
          onChange={this.handleChange}
        />;
        break;
      case 2:
        picker = <RangePicker
          styleName='marginRight15'
          placeholder={['起始月', '结束月']}
          format={monthFormat}
          mode={['month', 'month']}
          value={value}
          onChange={this.handleChange}
          onPanelChange={this.handlePanelChange}
        />;
        break;
      default:
        break;
    }
    return picker;
  };

  handlerSearch = () => {
    if (!this.state.value || !this.state.value[0]) return message.error('请选择时间');
    const { resetPage } = this.props;
    if (resetPage) resetPage();
    this.sendRequest();
  };

  onSelectProject2 = value => {
    this.setState({
      projectId: value
    });
  };

  Greeting = () => {
    // const projectData = this.props.projectData;
    if (this.props.projectData) {
      return (
        <>
          <span style={{ margin: '0 15px' }}>项目:</span>
          <Select style={{ width: 200 }} placeholder='选择项目' allowClear onChange={this.onSelectProject2}>
            { this.props.projectData && this.props.projectData.map(item => <Select.Option key={item.projectId} value={item.projectId}>{item.projectName}</Select.Option>)}
          </Select>
        </>
      );
    }
    return "";
  }



  render() {
    return (
      <>
        <div styleName='header'>
          <div>
            <span styleName='label marginRight15'>查询日期:</span>
            {this.renderDatePicker()}
            {this.Greeting()}
            <Button type='primary' style={{ marginLeft: '10px' }} onClick={this.handlerSearch}>查询</Button>
          </div>
          {this.renderTabs()}
        </div>
      </>
    );
  }
}
