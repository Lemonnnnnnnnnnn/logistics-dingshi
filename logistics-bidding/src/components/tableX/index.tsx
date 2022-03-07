import React, { ReactNode, useEffect } from "react";
import { Table, Form, TablePaginationConfig } from "antd";
import { ISearchListProps, IButtonListProps } from "../../declares";
import FormX from "../formX";
import styles from "./index.scss";

interface IProps {
  loading: boolean;
  rowKey: string;
  columns: any[];
  scroll?: {
    x?: string | number | true | undefined;
    y?: string | number | undefined;
  };
  components?: any;
  dataSource: any[];
  searchObj?: any;
  rowSelection?: any;
  pagination?: TablePaginationConfig;
  buttonList?: IButtonListProps[];
  searchList?: ISearchListProps[];
  extra?: ReactNode;
}
const TableX: React.FunctionComponent<IProps> = ({
  loading,
  rowKey,
  dataSource,
  columns,
  scroll,
  searchList,
  components,
  rowSelection,
  searchObj,
  pagination,
  buttonList,
  extra
}): JSX.Element => {
  const [form] = Form.useForm();

  const showTotal = () => {
    const newPagination = pagination || {};
    const { total = 0, pageSize = 10, current = 0 } = newPagination;

    const maxPage = Math.ceil(total / pageSize);

    return <span>{`共 ${total} 条记录 第 ${current} / ${maxPage} 页`}</span>;
  };

  useEffect(() => {
    form.setFieldsValue({ ...searchObj });
  }, [searchObj]);
  return (
    <div>
      <div className={styles.xSearchForm}>
        {searchList || buttonList ? (
          <FormX
            itemList={searchList}
            buttonList={buttonList}
            initData={searchObj}
            extra={extra}
          />
        ) : null}
      </div>
      <Table
        bordered
        components={components}
        rowKey={rowKey}
        columns={columns}
        loading={loading}
        scroll={scroll}
        pagination={
          pagination
            ? {
                showSizeChanger: true,
                showTotal,
                ...pagination
              }
            : false
        }
        rowSelection={rowSelection || null}
        dataSource={dataSource}
      />
    </div>
  );
};
export default TableX;
