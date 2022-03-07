import React, { useCallback, useEffect, useState } from "react";
import { Modal, Row, Col, Button } from "antd";
import moment from "moment";
import { getTenderBidderNotify } from "@/services/apiService";
import { cloneDeep } from "@/utils/utils";

const tipTypeDict = {
  1: "邀标",
  2: "二次报价",
  3: "价格确认",
  4: "撤标"
};

const maskStyleHaveBC = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 1000,
  height: "100%"
};

const maskStyleNotHaveBC = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 1000,
  height: "100%"
};


const InviteTenderModal = () => {
  const [tenderNotifyList, setTenderNotifyList] = useState([]);
  useEffect(() => {
    getTenderBidderNotify().then(data => {
      const list = data.map(item => ({ ...item, showModal: true }));
      setTenderNotifyList((list));
    });

  }, []);

  const toggleShowStatus = (key) => {
    const newTenderNotifyList = cloneDeep(tenderNotifyList);
    newTenderNotifyList[key].showModal = false;
    setTenderNotifyList(newTenderNotifyList);
  };

  const routerOut = (tenderId) => {
    localStorage.removeItem("tender_token_str");
    localStorage.setItem("tender_token_str", "token_storage");
    window.location.href = `tender/notice/noticeDetail?tenderId=${tenderId}`;
  };

  const contentRender = (tenderNotifyItem, key) => {
    switch (tenderNotifyItem.tipType) {
      case 1: {
        return (
          <div className="m-5">
            <Row type='flex' justify='center'>
              <div>
                <div
                  style={{ fontSize: "1.1rem" }}
                >{tenderNotifyItem.organizationName}招标项目向您发布了一条{tipTypeDict[tenderNotifyItem.tipType]}信息
                </div>
                <div className="mt-1" style={{ paddingTop: "8px" }}>项目名称：{tenderNotifyItem.tenderTitle}</div>
                <div
                  className="mt-1"
                >投标起止日期： {moment(tenderNotifyItem.offerStartTime).format("YYYY-MM-DD HH:mm:ss")} ~ {moment(tenderNotifyItem.offerEndTime).format("YYYY-MM-DD HH:mm:ss")}
                </div>
              </div>
            </Row>
            <Row className="mt-3" type="flex" justify="space-around">
              <Button style={{ width: "7rem" }} onClick={() => routerOut(tenderNotifyItem.tenderId)} type="primary">查看</Button>
              <Button style={{ width: "7rem" }} onClick={() => toggleShowStatus(key)}>关闭</Button>
            </Row>
          </div>);

      }
      case 2: {
        return (
          <div className="m-5">
            <Row type='flex' justify='center'>
              <div>
                <div
                  style={{ fontSize: "1.1rem" }}
                >{tenderNotifyItem.organizationName}招标项目要求进行{tipTypeDict[tenderNotifyItem.tipType]}
                </div>
                <div
                  className="mt-1"
                >{tipTypeDict[tenderNotifyItem.tipType]}截至日期： {moment(tenderNotifyItem.priceTwoTime).format("YYYY-MM-DD HH:mm:ss")}
                </div>
              </div>
            </Row>
            {/* </Col> */}
            {/* </Row> */}
            <Row className="mt-3" type="flex" justify="space-around">
              <Button style={{ width: "7rem" }} onClick={() => routerOut(tenderNotifyItem.tenderId)} type="primary">立即报价</Button>
              <Button style={{ width: "7rem" }} onClick={() => toggleShowStatus(key)}>关闭</Button>
            </Row>
          </div>);
      }
      case 3: {
        return (
          <div className="m-5">
            <Row type='flex' justify='center'>
              <div>
                <div
                  style={{ fontSize: "1.1rem" }}
                >{tenderNotifyItem.organizationName}招标项目要求进行{tipTypeDict[tenderNotifyItem.tipType]}
                </div>
                <div
                  className="mt-1"
                >{tipTypeDict[tenderNotifyItem.tipType]}截至日期： {moment(tenderNotifyItem.priceConfirmTime).format("YYYY-MM-DD HH:mm:ss")}
                </div>
              </div>
            </Row>
            <Row className="mt-3" type="flex" justify="space-around">
              <Button style={{ width: "7rem" }} onClick={() => routerOut(tenderNotifyItem.tenderId)} type="primary">立即去确认</Button>
              <Button style={{ width: "7rem" }} onClick={() => toggleShowStatus(key)}>关闭</Button>
            </Row>
          </div>);
      }
      case 4: {
        return (
          <div className="m-5">
            <Row type='flex' justify='center'>
              <div>
                <div
                  style={{ fontSize: "1.1rem" }}
                >{tenderNotifyItem.organizationName}招标项目已经撤标！
                </div>
                <div className="mt-1">投标保证金及相关费用已退至贵司易键达账户，请查收！</div>
              </div>
            </Row>
            <Row className="mt-3" type="flex" justify="center">
              <Button style={{ width: "7rem" }} onClick={() => toggleShowStatus(key)}>关闭</Button>
            </Row>
          </div>);
      }
      default:
        return null;
    }
  };

  return (
    <>
      {
        tenderNotifyList.map((item, key) => (
          <Modal
            title={`${tipTypeDict[item.tipType]}提示`}
            width={800}
            maskClosable={false}
            destroyOnClose
            visible={item.showModal}
            maskStyle={key !== 0 ? maskStyleNotHaveBC : maskStyleHaveBC}
            footer={null}
          >
            {contentRender(item, key)}
          </Modal>
        ))
      }
    </>
  );
};

export default InviteTenderModal;
