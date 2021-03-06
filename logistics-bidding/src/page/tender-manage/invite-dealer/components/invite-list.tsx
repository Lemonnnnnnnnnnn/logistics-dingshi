import React, { useState, useCallback, useEffect, useMemo } from "react";
import * as H from "history";
import { Row, Button, Modal, message } from "antd";
import TableX from "@/components/tableX";
import {
  INVITE_COLUMN,
  IOrganizationsParams,
  IStoreProps,
  SHIPMENT_SEARCH_LIST,
  SHIPMENT_SEARCH_INIT,
  ITenderInvitedItem
} from "../../../../declares";
import AddShipmentModal from "./add-shipment-modal";
import { connect } from "dva";
import { inviteBidder } from "@/services/tender-manage-server";
import ConfirmModal from '@/components/confirm-modal'

interface IProps extends IStoreProps {
  history: H.History;
  inviteListDetailResps: ITenderInvitedItem[];
  getShipmentList: (params: IOrganizationsParams) => void;
  tenderId: number;
  getInvitedList: (payload: { tenderId: number }) => any;
}

const InviteList: React.FunctionComponent<IProps> = ({
  history,
  commonStore: { shipmentList },
  getShipmentList,
  tenderId,
  getInvitedList,
  inviteListDetailResps = [],
  loading
}): JSX.Element => {
  const [pageObj, setPageObj] = useState({
    current: 1,
    pageSize: 10
  });
  const isLoading = loading.effects["commonStore/getShipmentList"];

  const [selectedRowKeys, setSelectedRowKeys] = useState([] as number[]);

  const [searchObj, setSearchObj] = useState(SHIPMENT_SEARCH_INIT);

  const [searchModal, setSearchModal] = useState(false);

  useEffect(() => {
    refreshShipmentList();
  }, [searchObj, pageObj, inviteListDetailResps]);

  const refreshShipmentList = useCallback(() => {
    const { current, pageSize } = pageObj;
    getShipmentList({
      ...searchObj,
      limit: 10,
      offset: (current - 1) * pageSize,
      selectType: 2,
      organizationType: 5,
      isAvailable: 1,
      auditStatus: 1,
      notSelectOrganizationIdList:
        inviteListDetailResps.map(item => item?.organizationId).join(",") ||
        undefined
    });
  }, [inviteListDetailResps,searchObj, pageObj]);

  const pagination = {
    ...pageObj,
    onChange: (current: number, pageSize?: number) => {
      setPageObj({
        ...pageObj,
        current,
        pageSize: pageSize || pageObj.pageSize
      });
    }
  };

  const onSearch = useCallback(
    val => {
      setSearchObj(val);
    },
    [searchObj]
  );

  const onReset = useCallback(() => {
    setSearchObj(SHIPMENT_SEARCH_INIT);
  }, [searchObj]);

  const buttonList = [
    {
      label: "??????",
      btnType: "primary",
      key: "search",
      type: "search",
      onClick: onSearch
    },
    {
      label: "??????",
      key: "reset",
      onClick: onReset
    }
  ];

  const onSelectChange = (val: number[]) => {
    setSelectedRowKeys(val);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const onRouterReturn = () => {
    history.push("/tenderManage");
  };

  const confirmInvite = useCallback(() => {
    if (!selectedRowKeys.length) return message.error('???????????????????????????')

    const selectedMsg = shipmentList.items.filter(item => selectedRowKeys.find(_item => _item === item?.organizationId))
    const selectedNames = selectedMsg.map(item => item.organizationName).join(',')


    ConfirmModal(`???????????????"${selectedNames}"?????????????????????????????????`, () => inviteBidder({ organizationIdList: selectedRowKeys, tenderId }).then(() => {
      getInvitedList({ tenderId: Number(tenderId) }).then(res => {
        const { current, pageSize } = pageObj;
        getShipmentList({
          ...searchObj,
          limit: 10,
          offset: (current - 1) * pageSize,
          selectType: 2,
          organizationType: 5,
          isAvailable: 1,
          auditStatus: 1,
          notSelectOrganizationIdList:
            inviteListDetailResps.map(item => item?.organizationId).join(",") ||
            undefined
        });
      });
      message.success("???????????????");
      setSelectedRowKeys([]);
    }))()


  }, [inviteListDetailResps, pageObj, selectedRowKeys]);

  const onSwitchSearchModal = useCallback(() => {
    setSearchModal(!searchModal);
  }, [searchModal]);

  const extra = useMemo(
    () => (
      <div>
        <span>?????????????????????????????????</span>
        <span onClick={onSwitchSearchModal} className="ml-1 text-link">
          ???????????????????????????
        </span>
      </div>
    ),
    []
  );

  return (
    <div>
      <Modal
        footer={null}
        visible={searchModal}
        title="???????????????"
        onCancel={onSwitchSearchModal}
        maskClosable={false}
        width={1040}
      >
        <AddShipmentModal refreshShipmentList={refreshShipmentList} />
      </Modal>
      <div className="p-2">
        <TableX
          loading={isLoading}
          rowKey="organizationId"
          rowSelection={rowSelection}
          dataSource={shipmentList.items}
          // scroll={{ x: "130%", y: 500 }} // ??????????????????
          searchList={SHIPMENT_SEARCH_LIST}
          searchObj={searchObj}
          pagination={{ ...pagination, total: shipmentList.count }}
          buttonList={buttonList}
          columns={INVITE_COLUMN}
          extra={extra}
        />
        <Row justify="space-around" style={{ paddingTop: "12px" }}>
          <Button size="large" onClick={confirmInvite} type="primary">
            ????????????
          </Button>
          <Button size="large" onClick={onRouterReturn}>
            ??????
          </Button>
        </Row>
      </div>
    </div>
  );
};

const mapStoreToProps = ({ commonStore, loading }: IStoreProps) => ({
  commonStore,
  loading
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: IOrganizationsParams }) => any
) => ({
  getShipmentList: (params: IOrganizationsParams) =>
    dispatch({
      type: "commonStore/getShipmentList",
      payload: params
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(InviteList);
