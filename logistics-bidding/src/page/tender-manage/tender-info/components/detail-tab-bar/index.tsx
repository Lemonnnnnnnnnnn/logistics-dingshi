import React, { useMemo, useState } from "react";
import { Tabs, Timeline } from "antd";
import styles from "./index.scss";
import TableX from "@/components/tableX";
import dayjs from "dayjs";
import { IPutBiddingParams, TENDER_EVENT_DICT } from "@/declares";
import { uniqBy } from "lodash";

const { TabPane } = Tabs;
interface IProps {
  data: IPutBiddingParams;
}
const EventBar: React.FunctionComponent<IProps> = ({ data }): JSX.Element => {
  const columns = [
    {
      title: "序号",
      key: "index",
      render: (_, __, index: number) => <span>{index + 1}</span>
    },
    {
      title: "投标公司",
      dataIndex: "organizationName"
    },
    {
      title: "投标包件",
      dataIndex: "sequenceList",
      render: (sequenceList: number[]) =>
        sequenceList && sequenceList.length
          ? sequenceList.map(item => `第${item}包`).join("、")
          : "-"
    },
    {
      title: "投标时间",
      dataIndex: "tenderBidderTime",
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      title: "二次报价时间",
      dataIndex: "tenderBidderSecondTime",
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      title: "确认价格时间",
      dataIndex: "priceConfirmationTime",
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
    }
  ];
  const columns2 = [
    {
      title: "序号",
      key: "index",
      render: (_, __, index: number) => <span>{index + 1}</span>
    },
    {
      title: "浏览公司",
      dataIndex: "organizationName"
    },
    {
      title: "浏览时间",
      dataIndex: "createTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss")
    }
  ];
  const columns3 = [
    {
      title: "交易方向",
      key: "name",
      render: (text: string) => "收入"
    },
    {
      title: "交易类型",
      dataIndex: "transactionType",
      render: (text: number) => {
        switch(text) {
          case 42:
            return "标书费收入";
          default:
        }
      }
    },
    {
      title: "交易金额",
      dataIndex: "transactionAmount",
      render: (text: string) => `+${text}`
    },
    {
      title: "交易时间",
      dataIndex: "createTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss")
    }
  ];
  const browserData = useMemo(() => {
    const list =
      data?.tenderEventResps?.filter(item => item.tenderEventType === 4) || [];
    const reverseList = list.reverse();
    const uniqList = uniqBy(reverseList, "organizationName");
    return uniqList.map((item, key) => ({
      index: key,
      organizationName: item.organizationName,
      createTime: item.createTime
    }));
  }, [data]);

  return (
    <div className={styles.eventBar}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="操作日志" key="1">
          <Timeline>
            {data?.tenderEventResps
              ?.filter(item => item.tenderEventType !== 4)
              .map(item => (
                <Timeline.Item color="green" key={item.tenderEventId}>
                  <p style={{ marginBottom: "0px", color: "#999" }}>
                    {dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss")}
                  </p>
                  <p>
                    <span>{item.createUserName}</span>
                    <span className="ml-1">
                      {TENDER_EVENT_DICT[item.tenderEventType]}
                    </span>
                    {item.tenderEventDetail && (
                      <span className="ml-1">{item.tenderEventDetail}</span>
                    )}
                  </p>
                </Timeline.Item>
              ))}
          </Timeline>
        </TabPane>
        <TabPane tab="投标记录" key="2">
          <TableX
            loading={false}
            rowKey="organizationId"
            dataSource={data?.bidderDetailEventResps}
            columns={columns}
          />
        </TabPane>
        <TabPane tab="浏览记录" key="3">
          <TableX
            loading={false}
            rowKey="tenderEventId"
            dataSource={browserData}
            columns={columns2}
          />
        </TabPane>
        <TabPane tab="收支记录" key="4">
          <TableX
            loading={false}
            rowKey="transactionId"
            dataSource={data?.transactionEntities}
            columns={columns3}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};
export default EventBar;
