import React, { useState } from "react";
import { Form, Button, TablePaginationConfig } from "antd";
import { ISearchListProps, IButtonListProps } from "../../declares";
import TableX from "./index";
import { v4 as uuidv4 } from 'uuid';
import styles from "./index.scss";
import EditableCell from "./edit-table-cell";

interface IProps {
  loading: boolean;
  hasAdd: boolean; // 是否有添加按钮
  rowKey: string;
  columns: any[];
  dataSource: any[];
  searchObj?: any;
  scroll?: any;
  rowSelection?: any;
  setIsEdit?: (bool: boolean) => void; // 暴露出去当前是否在编辑
  setDatas: (list: any[]) => void; //可获取添加数据后的数组
  pagination?: TablePaginationConfig;
  buttonList?: IButtonListProps[];
  searchList?: ISearchListProps[];
}
const EditableTable: React.FunctionComponent<IProps> = (props): JSX.Element => {
  const { setIsEdit } = props;
  const [form] = Form.useForm();
  const [data, setData] = useState(props.dataSource);
  const [editingKey, setEditingKey] = useState("");

  const isEditing = (record: any) => record[props.rowKey] === editingKey;

  const onDelete = (key: any, index: number) => () => {
    const newData = data.filter(item => item[props.rowKey] !== key);
    props.setDatas(newData);

    if (index + 1 === data.length) {
      setEditingKey("");
      if (setIsEdit) {
        setIsEdit(false);
      }
      form.resetFields();
    }
    setData(newData);
  };

  const save = async (key: any) => {
    try {
      const row = await form.validateFields();

      const newData = [...data];
      const index = newData.findIndex(item => key === item[props.rowKey]);
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row
      });
      setData(newData);
      setEditingKey("");
      if (setIsEdit) {
        setIsEdit(false);
      }
      props.setDatas(newData);
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };
  const mergedColumns = [
    ...props.columns,
    {
      title: "操作",
      width: 100,
      dataIndex: "operation",
      render: (_: any, record: any, index: number) => {
        const editable = isEditing(record);
        return editable ? (
          <>
            <span
              onClick={() => save(record[props.rowKey])}
              style={{
                marginRight: 8,
                color: "#1890ff",
                cursor: "pointer"
              }}
            >
              添加
            </span>
            <span
              onClick={onDelete(record[props.rowKey], index)}
              style={{ color: "#1890ff", cursor: "pointer" }}
            >
              删除
            </span>
          </>
        ) : props.hasAdd ? (
          <span
            onClick={onDelete(record[props.rowKey], index)}
            style={{ color: "#1890ff", cursor: "pointer" }}
          >
            删除
          </span>
        ) : null;
      }
    }
  ].map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editRender: col.editRender,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });

  return (
    <div className={styles.editTable}>
      <Form form={form} component={false}>
        <TableX
          rowKey={props.rowKey}
          components={{
            body: {
              cell: EditableCell
            }
          }}
          loading={props.loading}
          dataSource={data}
          scroll={props.scroll}
          columns={mergedColumns}
        />
        {props.hasAdd && (
          <div className={styles.editBtn}>
            <Button
              disabled={editingKey !== ""}
              onClick={() => {
                form.resetFields();
                const newItem = {
                  [props.rowKey]: `${uuidv4()}`,
                  editing: true
                };
                form.setFieldsValue(newItem);
                setData([...data, newItem]);
                if (setIsEdit) {
                  setIsEdit(true);
                }
                setEditingKey(newItem[props.rowKey]);
              }}
            >
              添加
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};
export default EditableTable;
