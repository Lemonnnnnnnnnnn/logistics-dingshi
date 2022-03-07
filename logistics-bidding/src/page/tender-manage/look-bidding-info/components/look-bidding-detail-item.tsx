import React, { useEffect } from "react";
import { Col, Form, Row } from "antd";
import styles from "./index.scss";
import UploadX from "@/components/uploadX";
import { ITenderBidderRespsData, UpdateType } from "@/declares";
import UnlockInfoTable from "./bidding-info-table";
import dayjs from "dayjs";

interface IProps {
  data: any;
  index: number;
}

const UnlockInfoDetailItem: React.FunctionComponent<IProps> = ({
  data,
  index
}): JSX.Element => {
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({
      tenderBidderDentryid:
        data && data.tenderBidderDentryid
          ? data.tenderBidderDentryid.split(",")
          : []
    });
  }, [data]);
  return (
    <div className={`wrapBox ${styles.lookBiddingDetailItem}`}>
      <div className={styles.lookBiddingItemTitle}>
        {index}、{data.organizationName}
      </div>
      <Row>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>投标时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {dayjs(data.tenderBidderTime).format("YYYY-MM-DD HH:mm:ss")}
          </span>
        </Col>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>业务联系人：</span>
        </Col>
        <Col span={12}>
          <span>
            {data.bidderContactEntities
              ? data.bidderContactEntities
                  .map(item =>
                    item.contactName
                      ? `${item.contactName ? item.contactName : "-"}(${
                          item.contactPhone ? item.contactPhone : "-"
                        })`
                      : "-"
                  )
                  .join(",")
              : "-"}
          </span>
        </Col>
      </Row>
      <Row style={{ borderTop: 0 }}>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>二次报价时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {data.tenderBidderSecondTime
              ? dayjs(data.tenderBidderSecondTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </span>
        </Col>
        <Col span={4} style={{ textAlign: "right", color: "#333" }}>
          <span>价格确认时间：</span>
        </Col>
        <Col span={4}>
          <span>
            {data.priceConfirmationTime
              ? dayjs(data.priceConfirmationTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </span>
        </Col>
        <Col span={4} />
        <Col span={4} />
      </Row>
      <div className={styles.unlockInfoSubTitle}>项目报价：</div>
      {data.bidderPackageDetailResps &&
        data.bidderPackageDetailResps.map((item) => (
          <UnlockInfoTable
            key={item.tenderBidderPackageId}
            data={item}
            organizationId={data?.organizationId}
            tenderBidderStatus={data.tenderBidderStatus}
          />
        ))}
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
    </div>
  );
};

export default UnlockInfoDetailItem;
