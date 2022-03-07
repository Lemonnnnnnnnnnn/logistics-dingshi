import React, { useEffect } from 'react';
import moment from 'moment';
import { Select, Input, Form, Button, DatePicker } from 'antd';
import Authorized from "../../utils/Authorized";
import styles from './table.less';

const { RangePicker } = DatePicker;

const RenderSearchInput = ({ searchList = [], form, buttonList, searchObj = {} }) => {
  useEffect(() => {
    if (searchObj) {
      form.setFieldsValue({ ...searchObj });
    }
  }, []);
  const onClick = (item) => () => {
    if (item.key === 'reset') {
      item.params.forEach(_item=>{
        form.setFieldsValue({
          [_item] : undefined
        });
      });
    }
    form.validateFields((err, values) => {
      item.onClick(values);
    });
  };
  const renderItem = (item) => {
    let _props = {};
    if ( item && item.showSearch) {
      _props = { showSearch: true, optionFilterProp: "children" };
    }
    const initialValue = item.value !== undefined ? item.value : undefined;
    switch (item && item.type) {
      case 'input':
        return form.getFieldDecorator(`${item.key}`, {
          initialValue
        })(<Input allowClear={item.allowClear} placeholder={item.placeholder} />);
      case 'time':
        return form.getFieldDecorator(`${item.key}`, {
          initialValue
        })(<RangePicker placeholder={item.placeholder}  disabledDate={(current) => current && current > moment().add('days', 1).startOf('day')} />);
      case 'select':
        return form.getFieldDecorator(`${item.key}`, {
          initialValue
        })(
          <Select {..._props} placeholder={item.placeholder}>
            {item.options &&
              item.options.map(option => (
                <Select.Option key={option.key} {...option}>
                  {option.label}
                </Select.Option>
              ))}
          </Select>
        );
      default:
        return <></>;
    }
  };
  return (
    <div className={styles.xSearchForm}>
      <Form>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
          { searchList && searchList.map(item =>  (
            <Form.Item label={item.label} key={item.key}>
              {renderItem(item)}
            </Form.Item>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
          {buttonList &&	buttonList.map(item => item.authority ? (
            <Authorized authority={[...item.authority]} key={item.key}>
              <Form.Item>
                <Button onClick={onClick(item)} type={item.btnType ? item.btnType : ""}>
                  {item.label}
                </Button>
              </Form.Item>
            </Authorized>
          ) : (
            <Form.Item key={item.key}>
              <Button onClick={onClick(item)} type={item.btnType ? item.btnType : ""}>
                {item.label}
              </Button>
            </Form.Item>
          ))
          }
        </div>
      </Form>
    </div>
  );
};
export default Form.create()(RenderSearchInput);
