import React from "react";
import { Form, Input, InputNumber } from "antd";
import TableX from "../../../../components/tableX";
import {
  ITenderPackageItems,
  GOODS_UNITS_DICT,
  IPackageCorrelationItem
} from "@/declares";

interface IProps extends ITenderPackageItems {
  selectedPackage: number[];
  selectPackage: (val: number[]) => void;
}

const myDidPackageItem: React.FC<IProps> = ({
  packageCorrelationResps,
  selectedPackage,
  selectPackage
}): JSX.Element => {
  const selectExactPackage = (tenderPackageId: number) => {
    if (!selectedPackage.find(item => item === tenderPackageId)) {
      selectPackage([...selectedPackage, tenderPackageId]);
    }
  };

  const columns = [
    {
      title: "线路",
      key: "index",
      width: 70,
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>
    },
    {
      title: "货品",
      // dataIndex: "goodsName",
      render : (text , record)=> <div>{record.categoryName}-{record.goodsName}</div>
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
      title: "计量单位",
      dataIndex: "goodsUnit",
      render: (text: string) => <div>{GOODS_UNITS_DICT[text]}</div>
    },
    {
      title: "含税运费（元/计量单位）",
      dataIndex: "taxContain",
      width: 120,
      render: (text: string, record: IPackageCorrelationItem) => {
        const { tenderPackageId, packageCorrelationId, maxContain } = record;

        return (
          <Form.Item
            name={[
              `key${tenderPackageId}`,
              `taxContain&${packageCorrelationId}`
            ]}
            initialValue={
              record.bidderOfferItems && record.bidderOfferItems.length
                ? record.bidderOfferItems[0].taxContain
                : text
            }
            rules={[
              {
                required: !!selectedPackage.find(
                  item => item === tenderPackageId
                ),
                message: "请输入含税运费！"
              },
              {
                type: "number",
                max: maxContain,
                message: `报价不能超过限价${maxContain}`
              }
            ]}
          >
            <InputNumber
              onChange={() => selectExactPackage(tenderPackageId)}
              placeholder={maxContain ? `限价${maxContain}` : undefined}
              min={0}
            />
          </Form.Item>
        );
      }
    },
    {
      title: "不含税运费（元/计量单位）",
      dataIndex: "taxNotContain",
      width: 120,
      render: (text: string, record: IPackageCorrelationItem) => {
        const { tenderPackageId, packageCorrelationId, maxNotContain } = record;
        return (
          <Form.Item
            name={[
              `key${tenderPackageId}`,
              `taxNotContain&${packageCorrelationId}`
            ]}
            initialValue={
              record.bidderOfferItems && record.bidderOfferItems.length
                ? record.bidderOfferItems[0].taxNotContain
                : text
            }
            rules={[
              {
                required: !!selectedPackage.find(
                  item => item === tenderPackageId
                ),
                message: "请输入不含税运费！"
              },
              {
                type: "number",
                max: maxNotContain,
                message: `报价不能超过限价${maxNotContain}`
              }
            ]}
          >
            <InputNumber
              onChange={() => selectExactPackage(tenderPackageId)}
              placeholder={maxNotContain ? `限价${maxNotContain}` : undefined}
              min={0}
            />
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
            initialValue={
              record.bidderOfferItems && record.bidderOfferItems.length
                ? record.bidderOfferItems[0].maximumCapacity
                : text
            }
            rules={[
              {
                required: !!selectedPackage.find(
                  item => item === tenderPackageId
                ),
                message: "请输入预计月最大运输量！"
              }
            ]}
          >
            <InputNumber min={0} />
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
            initialValue={
              record.bidderOfferItems && record.bidderOfferItems.length
                ? record.bidderOfferItems[0]?.remark
                : text
            }
          >
            <Input style={{ width: "100%" }} />
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
      dataSource={packageCorrelationResps.map((item, index) => ({
        ...item,
        index: index + 1
      }))}
    />
  );
};
export default myDidPackageItem;
