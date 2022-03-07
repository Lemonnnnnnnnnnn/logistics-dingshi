import React, { useState } from "react";
import { Table, Input, InputNumber, Popconfirm, Form, Typography } from "antd";

interface IEditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  editRender: (text: string, row: any, index: number) => React.ReactNode;
  record: IItem;
  index: number;
  children: React.ReactNode;
}
interface IItem {
  key: string;
  name: string;
  age: number;
  address: string;
}
const EditableCell: React.FC<IEditableCellProps> = ({
  editing,
  dataIndex,
  title,
  editRender,
  record,
  index,
  children,
  ...restProps
}): JSX.Element => {
  return (
    <td {...restProps}>
      {editing ? editRender(title, record, index) : children}
    </td>
  );
};
export default EditableCell;
