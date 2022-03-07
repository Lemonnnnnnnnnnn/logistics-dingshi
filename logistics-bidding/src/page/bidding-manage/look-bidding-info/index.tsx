import React, { useEffect, useState, useCallback } from "react";
import { History } from "history";
import { Button, Col, Form, Row, Tabs, Timeline } from "antd";
import styles from "./index.scss";
import CommonHeader from "../../tender-manage/components/common-header";
import UnlockInfoTable from "@/page/tender-manage/look-bidding-info/components/bidding-info-table";
import UploadX from "@/components/uploadX";
import {
  IStoreProps,
  UpdateType,
  IBidderContactItems,
  BidderStatus
} from "@/declares";
import { connect } from "dva";
import dayjs from "dayjs";
import { renderText } from "@/utils/utils";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderId: number;
    tenderNo: string;
  };
}

interface IProps extends IStoreProps {
  location: ILocation;
  history: History;
  getTenderBidderDetail: (tenderId: number) => void;
}

const { TabPane } = Tabs;

const UnlockInfoDetail: React.FunctionComponent<IProps> = ({
  history,
  location: {
    state: { tenderId, tenderTitle, tenderNo }
  },
  biddingManageStore: { tenderBidderDetail },
  getTenderBidderDetail
}): JSX.Element => {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      tenderBidderDentryid:
        tenderBidderDetail && tenderBidderDetail.tenderBidderDentryid
          ? tenderBidderDetail.tenderBidderDentryid.split(",")
          : []
    });
  }, [tenderBidderDetail]);
  useEffect(() => {
    getTenderBidderDetail(tenderId);
  }, []);
  const renderBidderStatus = useCallback(
    (type: number) => {
      switch (type) {
        case BidderStatus.Pending:
          return "邀标待投";
        case BidderStatus.ToPaid:
          return "待支付";
        case BidderStatus.Tendered:
          return "已投标";
        case BidderStatus.ToTwoPrice:
          return "待二次报价";
        case BidderStatus.TwoPrice:
          return "二次报价";
        case BidderStatus.PriceSure:
          return "价格确认 ";
        case BidderStatus.PriceSured:
          return "已价格确认";
        case BidderStatus.WonTheBid:
          return "已中标";
        case BidderStatus.NoTheBid:
          return "未中标";
        default:
          return "-";
      }
    },
    [tenderBidderDetail]
  );
  return (
    <div className="center-main border-gray" style={{ marginBottom: "20px" }}>
      <CommonHeader
        tenderTitle={tenderTitle}
        tenderNo={tenderNo}
        history={history}
        tenderId={tenderId}
      />
      <div className={styles.unlockInfo}>
        <div className={styles.unlockInfoBgTitle}>
          <p>
            <span>交易状态：</span>
            <span>
              {renderText(
                tenderBidderDetail ? tenderBidderDetail.tenderStatus : 0
              )}
            </span>
          </p>
          <p>
            <span>招标状态：</span>
            <span>
              {renderBidderStatus(
                tenderBidderDetail ? tenderBidderDetail.tenderBidderStatus : 0
              )}
            </span>
          </p>
        </div>
        <Row>
          <Col span={4} style={{ textAlign: "right", color: "#333" }}>
            <span>投标单号：</span>
          </Col>
          <Col span={4}>
            <span>
              {tenderBidderDetail ? tenderBidderDetail.tenderBidderNo : "-"}
            </span>
          </Col>
          <Col span={4} style={{ textAlign: "right", color: "#333" }}>
            <span>创建人：</span>
          </Col>
          <Col span={4}>
            <span>
              {tenderBidderDetail && tenderBidderDetail.createUserName}
            </span>
          </Col>
          <Col span={4} style={{ textAlign: "right", color: "#333" }}>
            <span>投标时间：</span>
          </Col>
          <Col span={4}>
            <span>
              {tenderBidderDetail && tenderBidderDetail.tenderBidderTime
                ? dayjs(tenderBidderDetail.tenderBidderTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )
                : "-"}
            </span>
          </Col>
        </Row>
        <Row style={{ borderTop: 0, marginBottom: "20px" }}>
          <Col span={4} style={{ textAlign: "right", color: "#333" }}>
            <span>业务联系人：</span>
          </Col>
          <Col span={12}>
            {/*<span>2021-09-11 09:41</span>*/}
            {tenderBidderDetail?.bidderContactItems?.map(
              (item: IBidderContactItems, index: number) => (
                <span key={item.tenderBidderContactId}>
                  {index !== 0 && <span>，</span>}
                  <span>
                    {item.contactName}({item.contactPhone})
                  </span>
                </span>
              )
            )}
          </Col>
          {/*  */}
          <Col span={4} style={{ textAlign: "right", color: "#333" }}>
            <span></span>
          </Col>
          <Col span={4}>
            <span></span>
          </Col>
        </Row>
        <div className={styles.unlockInfoSubTitle}>项目报价：</div>
        {tenderBidderDetail?.tenderPackageItems?.map(item => (
          <div key={item.tenderPackageId}>
            <UnlockInfoTable
              data={item}
              tenderBidderStatus={tenderBidderDetail.tenderBidderStatus}
              organizationId={item.tenderBidderPackageEntity?.organizationId}
              type="SHIPMENT"
            />
          </div>
        ))}
        {/*  */}
        <div style={{ marginTop: "20px" }}>
          <Form form={form}>
            <Form.Item label="投标/资质文件">
              <UploadX
                onUpload={res => {
                  const old = form.getFieldValue("tenderBidderDentryid") || [];
                  form.setFieldsValue({ tenderBidderDentryid: [...old, res] });
                }}
                showList={form.getFieldValue("tenderBidderDentryid")}
                title="上传文件"
                showDownload={true}
                disable={true}
                renderMode={UpdateType.Btn}
              />
            </Form.Item>
          </Form>
        </div>
        <div className={styles.eventBar}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="操作日志" key="1">
              <Timeline>
                {tenderBidderDetail?.tenderEventItems
                  ?.filter(item => item.tenderEventType !== 4)
                  .map(item => (
                    <Timeline.Item color="green" key={item.tenderEventId}>
                      <p style={{ marginBottom: "0px", color: "#999" }}>
                        {dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss")}
                      </p>
                      <p>
                        {item.createUserName}
                        {item.tenderEventDetail}
                      </p>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </TabPane>
          </Tabs>
        </div>
        <div className="commonBtn">
          <Button onClick={() => history.push("/biddingManage")}>返回</Button>
        </div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getTenderBidderDetail: (tenderId: number) =>
    dispatch({
      type: "biddingManageStore/getTenderBidderDetail",
      payload: { tenderId }
    })
});

const mapStoreToProps = ({ biddingManageStore, loading }: IStoreProps) => ({
  biddingManageStore,
  loading
});

export default connect(mapStoreToProps, mapDispatchToProps)(UnlockInfoDetail);
