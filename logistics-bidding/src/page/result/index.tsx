import React, { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "../../components/search-bar";
// import SortBar from "./components/result-sort-bar";
import SortBar from "@/components/sort-bar";
import TableX from "../..//components/tableX";
import styles from "./index.scss";
import {
  IHomePageListParams,
  IHomePageListRes,
  IStoreProps,
  ITenderNotLoginGoodsItem,
  PROVINCE_OPTIONS,
  TENDER_BIDDER_STATUS_ENUM,
  TENDER_TYPE_DICT
} from "@/declares";
import { connect } from "dva";
import { renderOptions } from "@/utils/utils";
import dayjs from "dayjs";
import { History } from "history";
import { useDidRecover } from "react-router-cache-route";
import { unionBy } from "lodash";

const getBiddingResultType = "homeStore/getBiddingResult";

interface IProps extends IStoreProps {
  history: History;
  location: Location;
  getAllCategory: () => void;
  getBiddingResult: (
    params: IHomePageListParams & { viewMyself: boolean }
  ) => void;
}

const Result: React.FC<IProps> = ({
  getBiddingResult,
  getAllCategory,
  history,
  loading,
  homeStore: { biddingResult, categoryList }
}): JSX.Element => {
  const [pageObj, setPageObj] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchObj, setSearchObj] = useState({});

  const [viewMyself, setViewMyself] = useState(false);

  useEffect(() => {
    if (!categoryList.length) {
      getAllCategory();
    }
  }, []);

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
    [searchObj, pageObj]
  );

  useEffect(() => {
    getData();
  }, [pageObj, viewMyself, searchObj]);

  useDidRecover(() => {
    getData();
  }, [searchObj, pageObj, viewMyself]);

  const getData = useCallback(() => {
    const { current, pageSize } = pageObj;
    getBiddingResult({
      ...searchObj,
      limit: 10,
      tenderStatus: TENDER_BIDDER_STATUS_ENUM.Winning,
      offset: (current - 1) * pageSize,
      viewMyself
    });
  }, [searchObj, pageObj, viewMyself]);

  const searchOptions = useMemo(() => {
    return [
      {
        label: "??????",
        key: "tenderType",
        // options: TENDER_STATUS_OPTIONS
        options: renderOptions(TENDER_TYPE_DICT)
      },
      {
        label: "??????",
        key: "receivingProvince",
        options: PROVINCE_OPTIONS
      },
      {
        label: "????????????",
        key: "firstCategoryId",
        options: categoryList.map(item => ({
          label: item.categoryName,
          key: item.categoryId,
          value: item.categoryId
        }))
      }
    ];
  }, [categoryList]);

  const columns = [
    {
      title: "????????????",
      dataIndex: "tenderType",
      render: (text: number) => TENDER_TYPE_DICT[text]
    },
    {
      title: "????????????",
      dataIndex: "tenderNotLoginGoodsResps",
      render: (text: ITenderNotLoginGoodsItem[]) =>
        unionBy(text, 'firstCategoryName')?.map(item => (
          <div key={item.goodsName}>{item.firstCategoryName}</div>
        ))
    },
    {
      title: "????????????",
      dataIndex: "tenderOrganizationName"
    },
    {
      title: "????????????",
      dataIndex: "tenderTitle",
      render: (text: string, record: IHomePageListRes) => {
        const routerToDetail = () => {
          history.push({
            pathname: "/result/resultDetail",
            state: {
              isShowPrice: record.isShowPrice,
              tenderId: record.tenderId
            }
          });
        };
        return (
          <a onClick={routerToDetail} style={{ color: "#1890ff" }}>
            {text}-??????
          </a>
        );
      }
    },
    {
      title: "????????????",
      dataIndex: "offerStartTime",
      render: (text: string) =>
        text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"
    }
  ];
  const pagination = {
    ...pageObj,
    total: biddingResult.count,
    onChange: (current: number, pageSize?: number) => {
      setPageObj({ current, pageSize: pageSize || pageObj.pageSize });
    }
  };

  const isLoading = loading.effects[getBiddingResultType];

  return (
    <div className={`center-main ${styles.notice}`}>
      {categoryList.length && (
        <SearchBar
          onSearch={onSearch}
          searchOptions={searchOptions}
          initSearch={{}}
        />
      )}
      <SortBar onSearch={onSearch} setViewMyself={setViewMyself} />
      <div className={styles.noticeProjects}>
        <TableX
          loading={isLoading}
          pagination={pagination} // ?????????
          rowKey="tenderId"
          columns={columns}
          dataSource={biddingResult.items}
        />
      </div>
    </div>
  );
};

const mapStoreToProps = ({ commonStore, homeStore, loading }: IStoreProps) => ({
  commonStore,
  homeStore,
  loading
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload?: any }) => any
) => ({
  getAllCategory: () =>
    dispatch({
      type: "homeStore/getAllCategory"
    }),
  getBiddingResult: (params: IHomePageListParams & { viewMyself: boolean }) =>
    dispatch({
      type: getBiddingResultType,
      payload: params
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(Result);
