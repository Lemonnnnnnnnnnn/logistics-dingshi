import { Button, Col, Form, message, Modal, Row, Timeline } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.scss";
import TextArea from "antd/lib/input/TextArea";
import TableX from "@/components/tableX";
import applyEarnestMoneyRefund from "@/services/tender-manage-server";
import { patchApplyEarnestMoneyRefund } from "@/services/bidding-manage-server";
import {
  IStoreProps,
  ITenderBidderManageStoreProps,
  ITenderBidderRefundPackageResps
} from "@/declares";
import { connect } from "dva";
import dayjs from "dayjs";

interface IProps {
  visible: boolean;
  currentId: number;
  biddingManageStore: ITenderBidderManageStoreProps;
  getRefundInfo: (tenderId: number) => void;
  setVisible: (bool: boolean) => void;
}
const SurrenderApplicationModal: React.FunctionComponent<IProps> = ({
  visible,
  currentId,
  getRefundInfo,
  biddingManageStore: { refundInfo },
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  const [list, setList] = useState<ITenderBidderRefundPackageResps[]>([]);
  useEffect(() => {
    getRefundInfo(currentId);
  }, []);
  useEffect(() => {
    if (refundInfo && refundInfo.tenderBidderRefundPackageResps) {
      setList(refundInfo.tenderBidderRefundPackageResps);
    }
  }, [refundInfo]);

  // const earnestMoneyIsZero = useMemo(() => {
  //   return;
  // }, [refundInfo]);

  const canApply = useMemo(() => {
    if (!refundInfo) {
      return false;
    }
    const earnestMoneyIsZero = refundInfo?.tenderBidderRefundPackageResps.every(
      item => Number(item.earnestMoney) === 0
    );
      
    if(earnestMoneyIsZero) return false // 所有保证金都为0  不能提交申请
    if(refundInfo.earnestMoneyStatus === 2 || refundInfo.earnestMoneyStatus === 5) return true // 保证金状态为 已缴纳、审核失败时可以提交申请
    return false // 其他状态 ，不能提交申请

  }, [refundInfo]);

  const [value, setValue] = useState("");
  const handleOk = useCallback(() => {
    patchApplyEarnestMoneyRefund(currentId, value).then(res => {
      message.success("提交成功！");
      setVisible(false);
    });
  }, [visible, value]);
  const columns = [
    {
      title: "包件",
      dataIndex: "packageSequence",
      render: (text: number, row: ITenderBidderRefundPackageResps) =>
        `第${text}包 ${row.packageSequenceStr}`
    },
    {
      title: "保证金金额",
      dataIndex: "earnestMoney"
    },
    {
      title: "缴纳时间",
      dataIndex: "earnestMoneyPayTime",
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
    }
  ];
  return (
    <Modal
      title="退还保证金申请"
      visible={visible}
      footer={null}
      className="modal"
      width={850}
      centered
      onCancel={() => {
        setVisible(false);
        form.resetFields();
      }}
    >
      {false ? (
        <>
          <TableX
            loading={false}
            rowKey="packageSequence"
            columns={columns}
            dataSource={list}
          />
          <Row
            className={styles.modalTable}
            style={{ borderRight: "1px solid #ccc", marginTop: "20px" }}
          >
            <Col span={6}>审核通过时间：</Col>
            <Col span={6}>
              {refundInfo && refundInfo!.earnestMoneyAuditTime
                ? dayjs(refundInfo!.earnestMoneyAuditTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )
                : "-"}
            </Col>
            <Col span={6}>退回时间：</Col>
            <Col span={6}>
              {refundInfo && refundInfo!.earnestMoneyRefundTime
                ? dayjs(refundInfo!.earnestMoneyRefundTime).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )
                : "-"}
            </Col>
          </Row>

          <div>该项目的投标保证金已经退回！请到资金账户查看！</div>
        </>
      ) : (
        <>
          <TableX
            loading={false}
            rowKey="packageSequence"
            columns={columns}
            dataSource={list}
          />

          {canApply ? (
            <div style={{ marginTop: "20px" }}>
              <p>请填写申请退回保证金原因（选填）：</p>
              <TextArea
                rows={5}
                value={value}
                onChange={e => {
                  setValue(e.target.value);
                }}
              />
            </div>
          ) : null}
        </>
      )}

      <div className="commonBtn">
        {canApply ? (
          <Button type="primary" onClick={handleOk}>
            提交申请
          </Button>
        ) : null}
        <Button
          onClick={() => {
            setVisible(false);
            form.resetFields();
          }}
        >
          取消
        </Button>
      </div>
      {refundInfo && refundInfo.tenderEventEntities.length ? (
        <div style={{ marginTop: "20px" }}>
          <Timeline>
            {refundInfo.tenderEventEntities.map(item => (
              <Timeline.Item color="green" key={item.tenderEventId}>
                <p style={{ marginBottom: "0px", color: "#999" }}>
                  {dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss")}
                </p>
                <p>
                  {item.createUserName} {item.organizationName}{" "}
                  {item.tenderEventDetail}
                </p>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      ) : null}
    </Modal>
  );
};
const mapStoreToProps = ({ biddingManageStore, loading }: IStoreProps) => ({
  biddingManageStore,
  loading
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getRefundInfo: (tenderId: number) =>
    dispatch({
      type: "biddingManageStore/getRefundInfo",
      payload: { tenderId }
    })
});

export default connect(
  mapStoreToProps,
  mapDispatchToProps
)(SurrenderApplicationModal);
