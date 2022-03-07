import React, { useMemo } from "react";

import { ITenderPackageEntities } from "@/declares/tender-manage/tenderMainDetail";
import { GOODS_UNITS_DICT } from "@/declares";
import TableX from "@/components/tableX";

interface IProps {
  data: ITenderPackageEntities;
}

const LookBiddingPrintTable: React.FC<IProps> = ({ data }): JSX.Element => {
  const dataList = useMemo(() => {
    return data.packageCorrelationResps.map((item, key) => ({
      id: key + 1,
      goodsName: `${item.categoryName}-${item.goodsName}`,
      deliveryAddress: item.deliveryAddress,
      receivingAddress: item.receivingAddress,
      goodsUnit: GOODS_UNITS_DICT[item.goodsUnit],
      dealer: item.bidderOfferItems?.map(_item => _item.organizationName),
      taxContain: item.bidderOfferItems?.map(_item => _item.taxContain),
      taxNotContain: item.bidderOfferItems?.map(_item => _item.taxNotContain),
      maximumCapacity: item.bidderOfferItems?.map(
        _item => _item.maximumCapacity
      ),
      remark: item.bidderOfferItems?.map(_item => _item?.remark)
    }));
  }, [data]);

  const columns = [
    {
      title: "线路",
      fixed: true,
      width: 70,
      key: "id",
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>
    },
    {
      title: "货品",
      fixed: true,
      width: 150,
      dataIndex: "goodsName"
    },
    {
      title: "提货点",
      width: 150,
      dataIndex: "deliveryAddress"
    },
    {
      title: "卸货点",
      width: 150,
      dataIndex: "receivingAddress"
    },
    {
      title: "计量单位 ",
      dataIndex: "goodsUnit"
    },
    {
      title: "商家",
      dataIndex: "dealer",
      width: 100,
      className: "tdNoPadding",
      render: text => text?.map(item => <p key={item}>{item || "-"}</p>)
    },
    {
      title: "含税运费（元/计量单位）",
      dataIndex: "taxContain",
      className: "tdNoPadding",
      width: 80,
      render: text => text?.map(item => <p key={item}>{item || "-"}</p>)
    },
    {
      title: "不含税运费（元/计量单位）",
      dataIndex: "taxNotContain",
      className: "tdNoPadding",
      width: 80,
      render: text => text?.map(item => <p key={item}>{item || "-"}</p>)
    },
    {
      title: "预计月最大运输量",
      dataIndex: "maximumCapacity",
      width: 80,
      className: "tdNoPadding",
      render: text => text?.map(item => <p key={item}>{item || "-"}</p>)
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 200,
      className: "tdNoPadding",
      render: text => text?.map(item => <p key={item}>{item || "-"}</p>)
    }
  ];
  return (
    <TableX
      loading={false}
      rowKey="packageCorrelationId"
      dataSource={dataList}
      // scroll={{ x: "130%", y: 500 }} // 有左右滚动条
      columns={columns}
    />
  );
};

export default LookBiddingPrintTable;
