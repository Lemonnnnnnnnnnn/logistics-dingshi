import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "antd";
import * as H from "history";
import TableX from "@/components/tableX";
import {
  IBiddingItem,
  TENDER_SEARCH_LIST,
  TENDER_SEARCH_INIT,
  TENDER_CHINESE_DICT,
  TENDER_NO,
  TENDER_TITLE,
  PROJECT_CREATE_TIME,
  TENDER_TYPE,
  TENDER_STATUS,
  IS_MULTIPLE_WINNER,
  SUPPLIER_SCOPE,
  OFFER_TIME,
  TENDER_TIME,
  PageType,
  IStoreProps,
  ITenderManageStoreProps,
  IBiddingParams,
  TenderStatus,
  OrganizationType,
  SUPPLIER_SCOPE_DICT,
  TENDER_TYPE_DICT,
  ICommonStoreProps
} from "../../../declares";
import WithdrawModal from "./withdraw-modal";

import styles from "../index.scss";
import { connect } from "dva";
import dayjs from "dayjs";
import { omit, trimEnd } from "lodash";
import { renderText } from "@/utils/utils";
import { updateBidding } from "@/services/tender-manage-server";
import ConfirmModal from "@/components/confirm-modal";
import { useDidRecover } from "react-router-cache-route";

interface IProps {
  history: H.History;
  organizationType: number;
  tenderManageStore: ITenderManageStoreProps;
  commonStore: ICommonStoreProps;
  getBiddingList: (params: IBiddingParams) => any;
  loading: any;
}

const ManageList: React.FunctionComponent<IProps> = ({
  history,
  organizationType,
  tenderManageStore: { bidding },
  commonStore: { userInfo },
  getBiddingList,
  loading
}): JSX.Element => {
  const [pageObj, setPageObj] = useState({
    current: 1,
    pageSize: 10
  });
  const isLoading = loading.effects["tenderManageStore/getBiddingList"];

  const [currentId, setCurrentId] = useState(0);

  const [withdrawVisible, setWithdrawVisible] = useState(false);

  const [list, setList] = useState<IBiddingItem[]>([]);

  const columns = useMemo(() => {
    const operateList = [
      {
        label: "详情",
        key: 0,
        visible: true,
        showBtns: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        onClick: (record: IBiddingItem) =>
          history.push("/tenderManage/tenderInfo", {
            pageType: PageType.Detail,
            tenderId: record.tenderId
          })
      },
      {
        label: "编辑",
        key: 1,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM ? [] : [1, 2],
        onClick: (record: IBiddingItem) =>
          history.push("/tenderManage/tenderInfo", {
            pageType: PageType.Edit,
            tenderId: record.tenderId
          })
      },
      {
        label: "撤回",
        key: 2,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM ? [] : [2, 3],
        onClick: (record: IBiddingItem) => {
          setWithdrawVisible(true);
          setCurrentId(record.tenderId);
        }
      },
      {
        label: "邀请商家",
        key: 3,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM ? [] : [2, 3],
        onClick: (record: IBiddingItem) => {
          const { tenderTitle, tenderNo, tenderId } = record;
          history.push({
            pathname: "/tenderManage/inviteDealer",
            state: { tenderTitle, tenderNo, tenderId }
          });
        }
      },
      {
        label: "复制",
        key: 4,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM
            ? []
            : [1, 2, 3, 4, 5, 6, 7, 8, 9],
        onClick: (record: IBiddingItem) =>
          history.push("/tenderManage/tenderInfo", {
            pageType: PageType.Copy,
            tenderId: record.tenderId
          })
      },
      {
        label: "查看投标信息",
        key: 6,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM
            ? [8, 9]
            : [4, 5, 6, 7, 8, 9],
        onClick: (record: IBiddingItem) => {
          const { tenderTitle, tenderNo, seeIsConfirm } = record;
          history.push({
            pathname: "/tenderManage/lookBiddingInfo",
            state: {
              tenderTitle,
              tenderNo,
              tenderId: record.tenderId,
              seeIsConfirm
            }
          });
        }
      },
      {
        label: "评标结果",
        key: 7,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM
            ? [8]
            : [6, 7, 8],
        onClick: (record: IBiddingItem) => {
          const { tenderTitle, tenderNo, tenderId } = record;
          history.push({
            pathname: "/tenderManage/bidEvaluationResults",
            state: { tenderTitle, tenderNo, tenderId }
          });
        }
      },
      {
        label: "退保审核",
        key: 8,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM ? [] : [8],
        onClick: (record: IBiddingItem) => {
          const { tenderTitle, tenderNo, tenderId } = record;
          history.push({
            pathname: "/tenderManage/surrenderReview",
            state: { tenderTitle, tenderNo, tenderId }
          });
        }
      },
      {
        label: "录入评标结果",
        key: 9,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM ? [] : [4],
        onClick: (record: IBiddingItem) => {
          const { tenderTitle, tenderNo, tenderId, tenderStatus } = record;
          history.push({
            pathname: "/tenderManage/inputResult",
            state: { tenderTitle, tenderNo, tenderId, tenderStatus }
          });
        }
      },
      {
        label: "删除",
        key: 10,
        visible: true,
        showBtns:
          userInfo.organizationType === OrganizationType.PLATFORM ? [] : [1],
        onClick: (record: IBiddingItem) => {
          const { tenderId, tenderTitle } = record;
          ConfirmModal(`确认要删除“${tenderTitle}”，此操作不可逆！`, () =>
            updateBidding(tenderId, { isEffect: 0 }).then(() => {
              refresh();
            })
          )();
        }
      }
    ];
    return [
      {
        title: TENDER_CHINESE_DICT[TENDER_NO],
        dataIndex: TENDER_NO,
        width: 140
      },
      {
        title: TENDER_CHINESE_DICT[TENDER_TITLE],
        dataIndex: TENDER_TITLE,
        key: TENDER_TITLE
      },
      {
        title: TENDER_CHINESE_DICT[TENDER_TYPE],
        dataIndex: TENDER_TYPE,
        key: TENDER_TYPE,
        render: (text: number) => <div>{TENDER_TYPE_DICT[text]}</div>
      },
      {
        title: TENDER_CHINESE_DICT[SUPPLIER_SCOPE],
        dataIndex: SUPPLIER_SCOPE,
        key: SUPPLIER_SCOPE,
        render: (text: number) => <div>{SUPPLIER_SCOPE_DICT[text]}</div>
      },
      {
        title: TENDER_CHINESE_DICT[IS_MULTIPLE_WINNER],
        dataIndex: IS_MULTIPLE_WINNER,
        render: (text: number) => (text ? "是" : "不是")
      },
      {
        title: TENDER_CHINESE_DICT[TENDER_STATUS],
        dataIndex: TENDER_STATUS,
        render: (text: number) => renderText(text)
      },
      {
        title: TENDER_CHINESE_DICT[PROJECT_CREATE_TIME],
        dataIndex: "tenderPublicTime",
        width: 180,
        render: (text: string) =>
          text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
      },
      {
        title: TENDER_CHINESE_DICT[OFFER_TIME],
        key: OFFER_TIME,
        width: 390,
        render: (row: IBiddingItem) =>
          `${
            row.offerStartTime
              ? dayjs(row.offerStartTime).format("YYYY-MM-DD HH:mm:ss")
              : "--"
          } ~  ${
            row.offerEndTime
              ? dayjs(row.offerEndTime).format("YYYY-MM-DD HH:mm:ss")
              : "--"
          }`
      },
      {
        // title: TENDER_CHINESE_DICT[TENDER_TIME],
        title: "开标日期（二次报价、价格确认截至日期）",
        dataIndex: "tenderOpenTime",
        width: 180,
        render: (text: string, record: IBiddingItem) => {
          if(record.priceConfirmTime){
            return dayjs(record.priceConfirmTime).format("YYYY-MM-DD HH:mm:ss")
          }

          if(record.priceTwoTime){
            return dayjs(record.priceTwoTime).format("YYYY-MM-DD HH:mm:ss")
          }


          return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
        }
      },
      {
        title: "操作",
        key: "operate",
        fixed: "right",
        width: 220,
        //  && record.isRefundAuditExist
        render: (text: any, record: IBiddingItem) => {
          let showList = operateList.filter(item =>
            item.showBtns.includes(record.tenderStatus)
          );
          //如果没有为审核的退保申请了就不显示退保审核按钮
          if (!record.isRefundAuditExist) {
            showList = showList.filter(item => item.key !== 8);
          }
          // 如果平台方已撤回状态下没有投标者就不显示查看投标和评标结果
          if (
            record.tenderStatus === TenderStatus.Withdrawn &&
            !record.isTenderBidder &&
            userInfo.organizationType === OrganizationType.PLATFORM
          ) {
            showList = showList.filter(
              item => item.key !== 6 && item.key !== 7
            );
          }
          if (!record.isUnlock) {
            showList = showList.filter(
              item => item.key !== 9 && item.key !== 10 && item.key !== 7
            );
          }
          return showList.map(item =>
            item.visible ? (
              <span
                key={item.key}
                onClick={() => item.onClick && item.onClick(record)}
                className="mr-1 text-link"
              >
                {item.label}
              </span>
            ) : null
          );
        }
      }
    ];
  }, []);

  const [searchObj, setSearchObj] = useState(TENDER_SEARCH_INIT);

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

  const getData = useCallback(
    () => {
      const { current, pageSize } = pageObj;
      getBiddingList({
        limit: 10,
        offset:  (current - 1) * pageSize,
        publicStartTime: searchObj.time
          ? dayjs(searchObj.time[0])
              .startOf("day")
              .format("YYYY/MM/DD HH:mm:ss")
          : undefined,
        publicEndTime: searchObj.time
          ? dayjs(searchObj.time[1])
              .endOf("day")
              .format("YYYY/MM/DD HH:mm:ss")
          : undefined,
        offerStartTime: searchObj.offerTime
          ? dayjs(searchObj.offerTime[0])
              .startOf("day")
              .format("YYYY/MM/DD HH:mm:ss")
          : undefined,
        offerEndTime: searchObj.offerTime
          ? dayjs(searchObj.offerTime[1])
              .endOf("day")
              .format("YYYY/MM/DD HH:mm:ss")
          : undefined,
        tenderOpenTime: searchObj.tenderTime
          ? dayjs(searchObj.tenderTime[0])
              .startOf("day")
              .format("YYYY/MM/DD HH:mm:ss")
          : undefined,
        tenderEndTime: searchObj.tenderTime
          ? dayjs(searchObj.tenderTime[1])
              .endOf("day")
              .format("YYYY/MM/DD HH:mm:ss")
          : undefined,
        tenderStatusArr: searchObj.tenderStatus
          ? searchObj.tenderStatus.join(",")
          : undefined,
        ...omit(searchObj, "time", "offerTime", "tenderTime", "tenderStatus")
      });
    },
    [pageObj, searchObj, withdrawVisible]
  );

  useEffect(() => {
    if (!withdrawVisible) {
      getData();
    }
  }, [pageObj, withdrawVisible , searchObj]);


  useDidRecover(() => {
    refresh();
  }, [searchObj, pageObj]);

  const refresh = useCallback(() => {
    getData();
  }, [pageObj, searchObj, withdrawVisible]);

  useEffect(() => {
    setList(bidding.items);
  }, [bidding]);

  const onSearch = useCallback(
    val => {
      const { pageSize } = pageObj;
      setSearchObj(val);
      setPageObj({
        ...pageObj,
        current: 1,
        pageSize: pageSize || pageObj.pageSize
      });
    },
    [searchObj, pageObj]
  );

  const onReset = useCallback(() => {
    const { pageSize } = pageObj;
    setSearchObj(TENDER_SEARCH_INIT);
    setPageObj({
      ...pageObj,
      current: 1,
      pageSize: pageSize || pageObj.pageSize
    });
  }, [searchObj, pageObj]);

  const buttonList = [
    {
      label: "查询",
      btnType: "primary",
      key: "search",
      type: "search",
      onClick: onSearch
    },
    {
      label: "重置",
      key: "reset",
      onClick: onReset
    }
  ];

  return (
    <div className={styles.listWrapper}>
      <div className="p-2">
        {organizationType === OrganizationType.PLATFORM ? null : (
          <Button
            type="primary"
            className="mt-1 mb-1"
            onClick={() =>
              history.push("/tenderManage/tenderInfo", {
                pageType: PageType.Add
              })
            }
          >
            + 发布信息
          </Button>
        )}
        <TableX
          loading={isLoading}
          rowKey="tenderId"
          dataSource={list}
          scroll={{ x: "160%", y: 500 }} // 有左右滚动条
          searchList={TENDER_SEARCH_LIST}
          searchObj={searchObj}
          pagination={{ ...pagination, total: bidding.count }}
          buttonList={buttonList}
          columns={columns}
        />
      </div>
      <WithdrawModal
        visible={withdrawVisible}
        tenderId={currentId}
        setVisible={setWithdrawVisible}
      />
    </div>
  );
};

const mapStoreToProps = ({
  commonStore,
  tenderManageStore,
  loading
}: IStoreProps) => ({
  tenderManageStore,
  commonStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: IBiddingParams }) => any
) => ({
  getBiddingList: (params: IBiddingParams) =>
    dispatch({ type: "tenderManageStore/getBiddingList", payload: params })
});
export default connect(mapStoreToProps, mapDispatchToProps)(ManageList);
