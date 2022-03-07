import React from "react";
import { Form, Input } from "antd";
import TableX from "../../../../components/tableX";
import {
  ITenderPackageItems,
  GOODS_UNITS_DICT,
  IPackageCorrelationItem
} from "@/declares";

interface IProps extends ITenderPackageItems {
  selectedPackage: number[];
}

const myDidPackageItem: React.FC<IProps> = ({
  packageCorrelationResps,
  selectedPackage
}): JSX.Element => {
  const columns = [
    {
      title: "货品",
      dataIndex: "goodsName"
    },
    {
      title: "提货点",
      dataIndex: "deliveryName"
    },
    {
      title: "卸货点",
      dataIndex: "receivingName"
    },
    {
      title: "计量单位 ",
      dataIndex: "goodsUnit",
      render: (text: string) => <div>{GOODS_UNITS_DICT[text]}</div>
    },
    {
      title: "含税运费（元/计量单位）",
      dataIndex: "taxContain",
      width: 120,
      render: (text: string, record: IPackageCorrelationItem) => {
        const { tenderPackageId, packageCorrelationId } = record;

        return (
          <Form.Item
            name={[
              `key${tenderPackageId}`,
              `taxContain&${packageCorrelationId}`
            ]}
            initialValue={text}
            rules={[
              {
                required: !!selectedPackage.find(
                  item => item === tenderPackageId
                ),
                message: "请输入含税运费！"
              }
            ]}
          >
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "不含税运费（元/计量单位）",
      dataIndex: "taxNotContain",
      width: 120,
      render: (text: string, record: IPackageCorrelationItem) => {
        const { tenderPackageId, packageCorrelationId } = record;
        return (
          <Form.Item
            name={[
              `key${tenderPackageId}`,
              `taxNotContain&${packageCorrelationId}`
            ]}
            initialValue={text}
            rules={[
              {
                required: !!selectedPackage.find(
                  item => item === tenderPackageId
                ),
                message: "请输入不含税运费！"
              }
            ]}
          >
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "预计月最大运输量",
      dataIndex: "maximumCapacity",
      width: 120,
      render: (text: string, record: IPackageCorrelationItem) => {
        const { tenderPackageId, packageCorrelationId } = record;
        return (
          <Form.Item
            name={[
              `key${tenderPackageId}`,
              `maximumCapacity&${packageCorrelationId}`
            ]}
            initialValue={text}
            rules={[
              {
                required: !!selectedPackage.find(
                  item => item === tenderPackageId
                ),
                message: "请输入预计月最大运输量！"
              }
            ]}
          >
            <Input />
          </Form.Item>
        );
      }
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 200,
      render: (text: string, record: IPackageCorrelationItem) => {
        const { tenderPackageId, packageCorrelationId } = record;
        return (
          <Form.Item
            name={[`key${tenderPackageId}`, `remark&${packageCorrelationId}`]}
            initialValue={text}
          >
            <Input />
          </Form.Item>
        );
      }
    }
  ];

  return (
    <TableX
      loading={false}
      rowKey="packageCorrelationId"
      columns={columns}
      dataSource={packageCorrelationResps}
    />
  );
};
export default myDidPackageItem;
