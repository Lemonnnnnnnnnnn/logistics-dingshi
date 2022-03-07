import React, { useEffect, useState } from "react";
import TableX from "@/components/tableX";
import {
  IBidderPackageEntitiesData,
  IBidderOfferEntitiesData,
  ITenderPackageItems,
  IPackageCorrelationItem,
  GOODS_UNITS_DICT,
  IBidderOfferItem,
  BidderStatus
} from "@/declares";
import { Col, Row } from "antd";
import dayjs from "dayjs";
import { orderBy } from "lodash";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { toChinesNum } from "@/utils/utils";

interface IProps {
  data: IBidderPackageEntitiesData | ITenderPackageItems;
  organizationId: number;
  type?: string;
  tenderBidderStatus?: BidderStatus; // 承运方的状态用来判断报价列表是否显示 （价格确认： 待确认 和 第2次：待报价）
}
const UnlockInfoTable: React.FC<IProps> = ({
  data,
  organizationId,
  tenderBidderStatus,
  type
}): JSX.Element => {
  const renderPrice = (bidderOfferItems: any, key: string) => {
    let orderList = orderBy(bidderOfferItems, "offerTimes", "desc");
    // 如果有价格确认把价格确认放到数组第一位
    if (orderList.some(item => item.offerTimes === 0)) {
      orderList = orderList.filter(item => item.offerTimes !== 0);
      orderList.unshift(bidderOfferItems.find(item => item.offerTimes === 0));
    }
    const renderList: any[] = [];

    for (let i = 0; i < orderList.length; i++) {
      if (i + 1 < orderList.length && orderList[i].offerTimes !== 1) {
        const diff = orderList[i]?.[key] - orderList[i + 1]?.[key];
        const diffRender =
          diff !== 0 ? (
            <span className="ml-1">
              {diff > 0 ? (
                <ArrowUpOutlined style={{ color: "#d81e06" }} />
              ) : (
                <ArrowDownOutlined style={{ color: "#1afa29" }} />
              )}
              <span>{diff.toFixed(1)}</span>
            </span>
          ) : (
            <span className="ml-1">--</span>
          );
        const contentRender = (
          <p key={bidderOfferItems.offerTimes}>
            {orderList[i].offerTimes === 0
              ? `价格确认 `
              : `第${toChinesNum(Number(orderList[i].offerTimes))}次 `}
            {orderList[i].offerConfirmation === 1 ? (
              Number(orderList[i][key]).toFixed(2)
            ) : orderList[i].offerConfirmation === 2 ? (
              <span style={{ color: "#999" }}>未同意</span>
            ) : (
              <span style={{ color: "#999" }}>未确认</span>
            )}
            {orderList[i].offerConfirmation === 1 ? diffRender : null}
          </p>
        );
        renderList.unshift(contentRender);
      } else {
        const contentRender = (
          <p key={bidderOfferItems.offerTimes}>
            {`第${toChinesNum(Number(orderList[i].offerTimes))}次 `}
            {Number(orderList[i][key]).toFixed(2)}
          </p>
        );
        renderList.unshift(contentRender);
      }
    }
    return (
      <>
        {tenderBidderStatus === BidderStatus.ToTwoPrice ? (
          <p>
            第二次 <span style={{ color: "#999" }}>待报价</span>
          </p>
        ) : null}
        <p>{renderList.reverse().map(item => item)}</p>
      </>
    );
  };

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
      dataIndex: "goodsName",
      render: (text: string, row) => `${row.categoryName}-${text}`
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
      dataIndex: "goodsUnit",
      render: (text: number) => GOODS_UNITS_DICT[text]
    },
    {
      title: "含税运费（元/计量单位）",
      dataIndex: "bidderOfferItems",
      className: "tdNoPadding",
      render: (value, record: IPackageCorrelationItem) =>
        renderPrice(record.bidderOfferItems, "taxContain")
    },
    {
      title: "不含税运费（元/计量单位）",
      dataIndex: "bidderOfferItems",
      key: "value2",
      className: "tdNoPadding",
      render: (value, record: IPackageCorrelationItem) =>
        renderPrice(record.bidderOfferItems, "taxNotContain")
    },
    {
      title: "预计月最大运输量",
      dataIndex: "bidderOfferItems",
      className: "tdNoPadding",
      key: "value3",
      render: value => {
        return value
          ? value
              .filter(
                item =>
                  item?.organizationId === organizationId &&
                  item?.maximumCapacity
              )
              .map(item => (
                <p key={item.tenderBidderPackageId}>
                  {item.maximumCapacity ? item.maximumCapacity : "-"}
                </p>
              ))
          : "-";
      }
    },
    {
      title: "备注",
      dataIndex: "bidderOfferItems",
      className: "tdNoPadding",
      key: "value4",
      render: value => {
        return value
          ? value
              .filter(
                item => item?.organizationId === organizationId && item?.remark
              )
              .map(item => (
                <p key={item.tenderBidderPackageId}>
                  {item?.remark ? item.remark : "-"}
                </p>
              ))
          : "-";
      }
    }
  ];
  const [list, setList] = useState<IPackageCorrelationItem[] | any[]>([]);
  useEffect(() => {
    const newData = data.packageCorrelationResps.map((item, i) => ({
      ...item,
      id: i + 1
    }));
    setList(newData);
    if (type) {
      // 承运端查看详情的包件信息调整成和托运一样
      data.tenderFeePayTime = data.tenderBidderPackageEntity?.tenderFeePayTime;
      data.earnestMoneyPayTime =
        data.tenderBidderPackageEntity?.earnestMoneyPayTime;
      data.earnestMoneyRefundTime =
        data.tenderBidderPackageEntity?.earnestMoneyRefundTime;
      data.tenderFeeRefundTime =
        data.tenderBidderPackageEntity?.tenderFeeRefundTime;
      data.tenderPackageEntity = {
        ...data.tenderBidderPackageEntity,
        tenderFee: data?.tenderFee,
        earnestMoney: data?.earnestMoney,
        packageSequence: data?.packageSequence
      };
    }
  }, [data]);
  return (
    <>
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        第{data?.tenderPackageEntity?.packageSequence}包{" "}
        {data?.tenderPackageEntity?.tenderPackageTitle}
      </div>
      <Row>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>标书费：</span>
        </Col>
        <Col span={4}>
          <span>{data.tenderPackageEntity?.tenderFee}元</span>
        </Col>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>标书费交纳时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {data?.tenderFeePayTime && data.tenderPackageEntity?.tenderFee > 0
              ? dayjs(data?.tenderFeePayTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </span>
        </Col>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>投标保证金：</span>
        </Col>
        <Col span={4}>
          <span>{data.tenderPackageEntity?.earnestMoney}元</span>
        </Col>
      </Row>
      <Row style={{ borderTop: 0, marginBottom: "20px" }}>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>投标保证金缴纳时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {data &&
            data.earnestMoneyPayTime &&
            data.tenderPackageEntity?.earnestMoney > 0
              ? dayjs(data.earnestMoneyPayTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </span>
        </Col>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>投标保证金退回时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {data?.earnestMoneyRefundTime
              ? dayjs(data.earnestMoneyRefundTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </span>
        </Col>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>标书费退回时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {data && data.tenderFeeRefundTime
              ? dayjs(data.tenderFeeRefundTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </span>
        </Col>
      </Row>
      <TableX
        loading={false}
        rowKey="packageCorrelationId"
        dataSource={list}
        scroll={{ x: "130%", y: 500 }} // 有左右滚动条
        columns={columns}
      />
    </>
  );
};

export default UnlockInfoTable;
