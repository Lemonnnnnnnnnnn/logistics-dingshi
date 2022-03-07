import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as H from "history";
import TableX from "@/components/tableX";
import {
  BIDDING_SEARCH_LIST,
  IS_MULTIPLE_WINNER,
  IS_MULTIPLE_WINNER_DICT,
  IStoreProps,
  ITenderBidderItem,
  ITenderBidderParams,
  OFFER_TIME,
  PageType,
  SUPPLIER_SCOPE,
  SUPPLIER_SCOPE_DICT,
  TENDER_BIDDER_SEARCH_INIT,
  TENDER_BIDDER_STATUS,
  TENDER_BIDDER_STATUS_DICT,
  TENDER_BIDDER_STATUS_ENUM,
  TENDER_BIDDER_TIME,
  TENDER_CHINESE_DICT,
  TENDER_TIME,
  TENDER_TITLE,
  TENDER_TYPE,
  TENDER_TYPE_DICT
} from "../../declares";
import { connect } from "dva";
import PayModal from "@/components/pay-modal";
import { Link } from "dva/router";
import SurrenderApplicationModal from "./components/surrender-application-modal";
import { formatTime } from "@/utils/utils";
import { getTenderBidderDetail } from "@/services/bidding-manage-server";
import dayjs from "dayjs";
import { useDidRecover } from "react-router-cache-route";

interface IProps extends IStoreProps {
  history: H.History;
  getTenderBidderList: (params: ITenderBidderParams) => any;
}

const payModalColumns = [
  {
    title: "序号",
    dataIndex: "id"
  },
  {
    title: "费用项",
    dataIndex: "feeName"
  },
  {
    title: "金额",
    dataIndex: "number"
  },
  {
    title: "说明",
    dataIndex: "remark",
    width: 500
  }
];

const TenderManage: React.FunctionComponent<IProps> = ({
  history,
  getTenderBidderList,
  biddingManageStore: { tenderBidderList },
  loading
}): JSX.Element => {
  const [pageObj, setPageObj] = useState({
    current: 1,
    pageSize: 10
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const [visible, setVisible] = useState(false);
  const [currentId, setCurrentId] = useState(0);

  const [payVisible, setPayVisible] = useState(false);

  const [selectedTenderItem, setSelectedTenderItem] = useState({} as any);

  const isLoading = loading.effects["biddingManageStore/getTenderBidderList"];

  const columns = useMemo(() => {
    const getOperateList = (record: ITenderBidderItem) => {
      const { tenderType, tenderBidderStatus } = record;
      const viewDetail = {
        label: "查看投标信息",
        key: 0,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          const { tenderTitle, tenderId, tenderNo } = _record;
          history.push({
            pathname: "/biddingManage/lookBiddingInfo",
            state: { tenderTitle, tenderId, tenderNo }
          });
        }
      };
      const modify = {
        label: "修改投标信息",
        key: 1,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          const { tenderTitle, tenderId, tenderNo } = _record;
          history.push("/biddingManage/updateBiddingInfo", {
            tenderTitle,
            tenderId,
            tenderNo
          });
        }
      };
      const viewResult = {
        label: "评标结果",
        key: 7,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          const { tenderTitle, tenderId, tenderNo } = _record;
          history.push("/result/resultDetail", {
            tenderTitle,
            tenderId,
            tenderNo
          });
        }
      };
      const returnDepositReq = {
        label: "退保申请",
        key: 8,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          setVisible(true);
          setCurrentId(_record.tenderId);
        }
      };
      const bid = {
        label: "立即投标",
        key: 9,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          const { tenderTitle, tenderId, tenderNo } = _record;
          history.push({
            pathname: "/notice/noticeDetail/myDid",
            state: { tenderTitle, tenderId, tenderNo }
          });
        }
      };
      const pay = {
        label: "立即支付",
        key: 2,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          getTenderBidderDetail(_record.tenderId).then(res => {
            const { tenderPackageItems, tenderId } = res;
            const tenderFee = tenderPackageItems.reduce((total, current) => {
              total += current.tenderFee;
              return total;
            }, 0);

            const earnestMoney = tenderPackageItems.reduce((total, current) => {
              total += current.earnestMoney;
              return total;
            }, 0);

            const sumFeeDataSource = [
              {
                id: 1,
                feeName: "标书费",
                number: tenderFee,
                remark:
                  "该费用为本次投标标书制作费，由招标公司收取，若中途该标书撤回，将在3个工作内退回易键达账户，其它情况无论中标与否都不予退还"
              },
              {
                id: 2,
                feeName: "投标保证金",
                number: earnestMoney,

                remark:
                  "该费用为投标履行保证金，由平台收取，在开标后或标书撤回后，若未中标将在3个工作内退回易键达账户，若中标，则需要提交申请，招标方同意方能退回"
              },
              {
                id: 3,
                feeName: "小计",
                number: tenderFee + earnestMoney,
                remark: ""
              }
            ];
            setSelectedTenderItem({ tenderId, sumFeeDataSource });
            setPayVisible(true);
          });
        }
      };

      const quote = {
        label: "立即报价",
        key: 3,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          const { tenderTitle, tenderNo, tenderId } = _record;
          history.push({
            pathname: "/biddingManage/twoOfferPrice",
            state: { tenderTitle, tenderNo, tenderId }
          });
        }
      };

      const confirm = {
        label: "立即确认",
        key: 4,
        visible: true,
        onClick: (_record: ITenderBidderItem) => {
          const { tenderTitle, tenderNo, tenderId } = _record;
          history.push({
            pathname: "/biddingManage/surePrice",
            state: { tenderTitle, tenderNo, tenderId }
          });
        }
      };
      if (
        tenderType === 2 &&
        tenderBidderStatus === TENDER_BIDDER_STATUS_ENUM.WaitBidding
      ) {
        return [];
      }
      const dict: { [key: string]: any } = {
        [TENDER_BIDDER_STATUS_ENUM.WaitBidding]: [bid],
        [TENDER_BIDDER_STATUS_ENUM.WaitPay]: [viewDetail, modify, pay],
        [TENDER_BIDDER_STATUS_ENUM.Tendered]: [viewDetail],
        [TENDER_BIDDER_STATUS_ENUM.BiddingTwoOver]: [viewDetail],
        [TENDER_BIDDER_STATUS_ENUM.WaitBiddingTwo]: [viewDetail, quote],
        [TENDER_BIDDER_STATUS_ENUM.WaitPriceConfirm]: [viewDetail, confirm],
        [TENDER_BIDDER_STATUS_ENUM.PriceConfirmOver]: [viewDetail],
        [TENDER_BIDDER_STATUS_ENUM.Winning]: [
          viewDetail,
          viewResult,
          returnDepositReq
        ],
        [TENDER_BIDDER_STATUS_ENUM.Fail]: [viewDetail, viewResult],
        [TENDER_BIDDER_STATUS_ENUM.Withdrawn]: [viewDetail],
        [TENDER_BIDDER_STATUS_ENUM.NotBidding]: []
      };
      return dict[tenderBidderStatus] || [];
    };

    return [
      {
        title: TENDER_CHINESE_DICT[TENDER_TITLE],
        dataIndex: TENDER_TITLE,
        render: (text: string, row: any) => (
          <Link to={`/notice/noticeDetail?tenderId=${row.tenderId}`}>
            {text}
          </Link>
        )
      },
      {
        title: "投标单号",
        dataIndex: "tenderBidderNo"
      },
      {
        title: TENDER_CHINESE_DICT[TENDER_TYPE],
        dataIndex: TENDER_TYPE,
        render: (text: string) => TENDER_TYPE_DICT[text],
        width: 100
      },
      {
        title: TENDER_CHINESE_DICT[SUPPLIER_SCOPE],
        dataIndex: SUPPLIER_SCOPE,
        render: (text: string) => SUPPLIER_SCOPE_DICT[text]
      },
      {
        title: TENDER_CHINESE_DICT[IS_MULTIPLE_WINNER],
        dataIndex: IS_MULTIPLE_WINNER,
        render: (text: string) => IS_MULTIPLE_WINNER_DICT[text],
        width: 150
      },
      {
        title: TENDER_CHINESE_DICT[TENDER_BIDDER_TIME],
        dataIndex: TENDER_BIDDER_TIME,
        render: (text: string) => formatTime(text, true)
      },
      {
        title: TENDER_CHINESE_DICT[TENDER_BIDDER_STATUS],
        dataIndex: TENDER_BIDDER_STATUS,
        render: (text: string) => TENDER_BIDDER_STATUS_DICT[text]
      },
      {
        title: TENDER_CHINESE_DICT[OFFER_TIME],
        key: "offerEndTime",
        width: 390,
        render: (row: any) =>
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
        title: TENDER_CHINESE_DICT[TENDER_TIME],
        dataIndex: "tenderOpenTime",
        render: (text: string) => formatTime(text, true)
      },
      {
        title: "操作",
        dataIndex: "operate",
        width: 200,
        fixed: "right",
        render: (text: any, record: ITenderBidderItem) => {
          return getOperateList(record).map(
            (item: any) =>
              item.visible && (
                <span
                  key={item.key}
                  onClick={() => item.onClick && item.onClick(record)}
                  className="mr-1 text-link"
                >
                  {item.label}
                </span>
              )
          );
        }
      }
    ];
  }, []);

  const [searchObj, setSearchObj] = useState(TENDER_BIDDER_SEARCH_INIT);

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
    (reset = false) => {
      const { current, pageSize } = pageObj;
      getTenderBidderList({
        ...searchObj,
        limit: 10,
        offset: reset ? 0 : (current - 1) * pageSize
      });
    },
    [searchObj, pageObj]
  );

  useEffect(() => {
    if (!payVisible) {
      getData();
    }
  }, [pageObj, payVisible]);

  useEffect(() => {
    getData(true);
  }, [searchObj]);

  useDidRecover(() => {
    getData();
  }, [searchObj, pageObj]);

  const onSearch = useCallback(
    val => {
      setSearchObj(val);
      const { pageSize } = pageObj;
      setPageObj({
        ...pageObj,
        current: 1,
        pageSize: pageSize || pageObj.pageSize
      });
    },
    [searchObj]
  );

  const onReset = useCallback(() => {
    const { pageSize } = pageObj;
    setSearchObj(TENDER_BIDDER_SEARCH_INIT);
    setPageObj({
      ...pageObj,
      current: 1,
      pageSize: pageSize || pageObj.pageSize
    });
  }, [searchObj]);

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

  const onPayCallback = useCallback(() => {
    setPayVisible(false);
    onSearch(searchObj);
  }, [searchObj]);

  const onSelectChange = (rows: string[]) => {
    setSelectedRowKeys(rows);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  return (
    <div className="center-main">
      <div className="p-2">
        <TableX
          loading={isLoading}
          rowSelection={rowSelection}
          rowKey="tenderBidderId"
          dataSource={tenderBidderList.items}
          scroll={{ x: "170%", y: 500 }} // 有左右滚动条
          searchList={BIDDING_SEARCH_LIST}
          searchObj={searchObj}
          pagination={{ ...pagination, total: tenderBidderList.count }}
          buttonList={buttonList}
          columns={columns}
        />
      </div>

      {visible ? (
        <SurrenderApplicationModal
          visible={visible}
          setVisible={setVisible}
          currentId={currentId}
        />
      ) : null}
      {payVisible ? (
        <PayModal
          sumFeeDataSource={selectedTenderItem.sumFeeDataSource}
          visible={payVisible}
          columns={payModalColumns}
          tenderId={selectedTenderItem.tenderId}
          onCancel={onPayCallback}
        />
      ) : null}
    </div>
  );
};

const mapStoreToProps = ({
  biddingManageStore,
  commonStore,
  loading
}: IStoreProps) => ({
  commonStore,
  biddingManageStore,
  loading
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; params: ITenderBidderParams }) => any
) => ({
  getTenderBidderList: (params: ITenderBidderParams) =>
    dispatch({
      type: "biddingManageStore/getTenderBidderList",
      params
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(TenderManage);
