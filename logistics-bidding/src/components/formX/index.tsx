import React, { ReactNode, useCallback, useEffect } from "react";
import { Form, Button, DatePicker, Input, Select, Row } from "antd";
import dayjs from "dayjs";
import styles from "./index.scss";
import {
  ISearchListProps,
  IButtonListProps,
  ISelectOptionProps
} from "../../declares";
const { RangePicker } = DatePicker;

interface IProps {
  buttonList?: IButtonListProps[];
  itemList?: ISearchListProps[];
  initData?: any;
  extra?: ReactNode;
}

const FormX: React.FunctionComponent<IProps> = ({
  itemList,
  initData,
  buttonList,
  extra
}): JSX.Element => {
  const [form] = Form.useForm();
  const renderItem = useCallback(
    (item: ISearchListProps) => {
      let data = {};
      if (item && item.showSearch) {
        data = { showSearch: true, optionFilterProp: "children" };
      }
      switch (item && item.type) {
        case "input":
          return (
            <Input
              allowClear={item.allowClear}
              placeholder={item.placeholder}
            />
          );
        case "time":
          return (
            <RangePicker
              // disabledDate={current =>
              //   current &&
              //   current >
              //     dayjs()
              //       .add(1, "day")
              //       .startOf("day")
              // }
            />
          );
        case "month":
          return (
            <RangePicker
              format="YYYY-MM"
              mode={["month", "month"]}
              // onPanelChange={handlePanelChange(item.key)}
            />
          );
        case "select":
          return (
            <Select
              {...data}
              placeholder={item.placeholder}
              mode={item.mode ? item.mode : null}
            >
              {item.options &&
                item.options.map(
                  ({ label, key, ...other }: ISelectOptionProps) => (
                    <Select.Option {...other} key={key}>
                      {label}
                    </Select.Option>
                  )
                )}
            </Select>
          );
        default:
          return <></>;
      }
    },
    [initData]
  );
  const onSubmit = (item: IButtonListProps) => () => {
    form.validateFields().then(values => {
      item.onClick(values);
    });
  };
  useEffect(() => {
    form.setFieldsValue({ ...initData });
  }, [initData]);
  return (
    <div>
      <div className={styles.xSearchForm}>
        <Form form={form} initialValues={{ ...initData }}>
          {/* 搜索项 */}
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: "10px" }}>
            {itemList &&
              itemList.map(item => (
                <Form.Item
                  // style={{ width: "27%", marginRight: "4rem" }}
                  label={item.label}
                  key={item.key}
                  name={item.key}
                  rules={item.rules}
                >
                  {renderItem(item)}
                </Form.Item>
              ))}
          </div>
        </Form>
        {/* 按钮 */}
        <Row
          className="mt-2 mb-2"
          style={{ width: "100%", display: "flex", justifyContent: "end" }}
          align="middle"
        >
          {buttonList &&
            buttonList.map(item => (
              <div key={item.key}>
                <Button
                  onClick={onSubmit(item)}
                  type={
                    item.btnType
                      ? (item.btnType as
                          | "link"
                          | "text"
                          | "default"
                          | "primary"
                          | "ghost"
                          | "dashed")
                      : undefined
                  }
                >
                  {item.label}
                </Button>
              </div>
            ))}
          {extra && extra}
        </Row>
      </div>
    </div>
  );
};
export default FormX;
