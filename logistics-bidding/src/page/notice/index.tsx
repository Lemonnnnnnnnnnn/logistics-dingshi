import React, { useState, useEffect, useCallback, useMemo } from "react";
import SearchBar from "../../components/search-bar";
import SortBar from "../../components/sort-bar";
import ProjectItem from "../../components/project-item";
import styles from "./index.scss";
import {
  IHomePageListParams,
  IStoreProps,
  PROVINCE_OPTIONS,
  TENDER_STATUS_OPTIONS,
  INIT_TENDER_STATUS
} from "@/declares";
import { connect } from "dva";
import { Pagination } from "antd";
import { History } from "history";
import { useDidRecover } from "react-router-cache-route";

const getTenderBidderListType = "homeStore/getTenderNotice";
const initSearchParams = {
  // orderByTenderPublicTime: true,
  orderByOfferEndTime: undefined,
  tenderStatusArray: INIT_TENDER_STATUS,
  receivingProvince: undefined,
  firstCategoryId: undefined,
  tenderType: 1
};

interface ILocation extends Location {
  state: {
    categoryId?: number;
    categoryName?: string;
  };
}

interface IProps extends IStoreProps {
  history: History;
  location: ILocation;
  getAllCategory: () => void;
  getTenderNotice: (params: IHomePageListParams) => void;
}

const Notice: React.FC<IProps> = ({
  getTenderNotice,
  getAllCategory,
  loading,
  location,
  history,
  commonStore: { fuzzySearchStr },
  // state: { categoryId, categoryName }
  homeStore: { tenderNotice, categoryList }
}): JSX.Element => {
  const [pageObj, setPageObj] = useState({
    current: 1,
    pageSize: 32
  });
  const [searchObj, setSearchObj] = useState({
    ...initSearchParams,
    firstCategoryId: location?.state?.categoryId
  });
  const [searchListInit, setSearchListInit] = useState([] as any);

  useEffect(() => {
    if (location?.state?.categoryId) {
      setSearchListInit([
        {
          typeTitle: "货品类目",
          type: "firstCategoryId",
          key: location.state.categoryId,
          value: location.state.categoryId,
          label: location.state.categoryName
        }
      ]);
    }
  }, [location]);

  useEffect(() => {
    if (!categoryList.length) {
      getAllCategory();
    }
  }, []);

  const searchOptions = useMemo(() => {
    return [
      {
        label: "招标状态",
        key: "tenderStatusArray",
        options: TENDER_STATUS_OPTIONS
      },
      {
        label: "地区",
        key: "receivingProvince",
        options: PROVINCE_OPTIONS
      },
      {
        label: "货品类目",
        key: "firstCategoryId",
        options: categoryList.map(item => ({
          label: item.categoryName,
          key: item.categoryId,
          value: item.categoryId
        }))
      }
    ];
  }, [categoryList]);

  const isLoading = loading.effects[getTenderBidderListType];

  const getData = useCallback(() => {
    const { current, pageSize } = pageObj;
    getTenderNotice({
      ...searchObj,
      limit: 32,
      offset: (current - 1) * pageSize,
      fuzzySearchStr: fuzzySearchStr ? fuzzySearchStr : undefined
    });
  }, [searchObj, pageObj, fuzzySearchStr]);

  useEffect(() => {
    getData();
  }, [pageObj, fuzzySearchStr, searchObj]);

  useDidRecover(() => {
    getData();
  }, [searchObj, pageObj, fuzzySearchStr]);

  const onSearch = useCallback(
    val => {
      setSearchObj({ ...searchObj, ...val });
      const { pageSize } = pageObj;
      setPageObj({
        ...pageObj,
        current: 1,
        pageSize: pageSize || pageObj.pageSize
      });
    },
    [searchObj]
  );

  const onChangePage = useCallback(
    val => {
      setPageObj({
        ...pageObj,
        current: val
      });
    },
    [pageObj]
  );
  return (
    <div className={`center-main ${styles.notice} mb-3`}>
      {!fuzzySearchStr && categoryList.length ? (
        <SearchBar
          searchListInit={searchListInit}
          onSearch={onSearch}
          initSearch={initSearchParams}
          searchOptions={searchOptions}
        />
      ) : (
        <div className="wrapBox">
          <div>{`为您找到“${fuzzySearchStr}”相关结果约${tenderNotice.count}个`}</div>
        </div>
      )}
      <SortBar onSearch={onSearch} />
      <div className={styles.noticeProjects}>
        {tenderNotice.items.map(item => (
          <ProjectItem
            data={item}
            key={item.tenderId}
            history={history}
            fuzzySearchStr={fuzzySearchStr}
          />
        ))}
      </div>
      <Pagination
        total={tenderNotice.count}
        showTotal={total => `共有 ${total} 条记录`}
        current={pageObj.current}
        onChange={onChangePage}
        defaultPageSize={32}
        pageSizeOptions={[32]}
        showQuickJumper
      />
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
  getTenderNotice: (params: IHomePageListParams) =>
    dispatch({
      type: getTenderBidderListType,
      payload: params
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(Notice);
