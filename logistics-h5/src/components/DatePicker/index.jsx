import React, { Component } from 'react';
import { DatePicker as DatePick, List } from 'antd-mobile'
import moment from 'moment';

class DatePicker extends Component {
  render () {
    const { onChange, value, field:{ label, dateMode='date', placeholder, arrow='horizontal', listProps, ...rest } } = this.props
    return (
      <DatePick
        locale={{
          okText:'确定',
          dismissText:'取消'
        }}
        mode={dateMode}
        title={label}
        value={value?new Date(moment(value)):undefined}
        format={(date)=> moment(date).format('YYYY-MM-DD')}
        extra={placeholder}
        onChange={onChange}
        maxDate={new Date(2099, 11, 31)}
        {...rest}
      >
        <List.Item {...listProps} arrow={arrow}>
          {label}
        </List.Item>
      </DatePick>
    );
  }
}

export default DatePicker;
