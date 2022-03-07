import React, { useEffect, useState } from "react";
import {
  DownOutlined,
  UpOutlined,
  DeleteOutlined,
  CloseOutlined
} from "@ant-design/icons";
import styles from "./index.scss";
import { INIT_TENDER_STATUS, ISearchOptions } from "@/declares";
import { isEmpty, omit, omitBy } from "lodash";

interface IProps {
  searchOptions: ISearchOptions[];
  onSearch: (val: any) => void;
  searchListInit?: any;
  initSearch: any;
}

interface ISearchList {
  type: number | string;
  typeTitle: string;
  key: number;
  value: number;
  label: string;
}

const SearchHeader: React.FC<IProps> = ({
  searchOptions,
  onSearch,
  initSearch,
  searchListInit = []
}): JSX.Element => {
  const [searchList, setSearchList] = useState<ISearchList[]>(searchListInit);
  const [searchItems, setSearchItems] = useState(
    searchOptions.map(item => ({ ...item, openMore: false }))
  );

  const addSearch = (type: number, item: any, typeTitle: string) => () => {
    if (searchList.find(_item => _item.type === type)) {
      const newSearchList = searchList.map(_item => {
        if (_item.type === type) {
          return { ...item, type, typeTitle };
        }
        return _item;
      });
      setSearchList(newSearchList);
    } else {
      setSearchList([...searchList, { ...item, type, typeTitle }]);
    }
  };

  useEffect(() => {
    const params = searchList.reduce((total: any, current) => {
      total[current.type] = current.value;
      return total;
    }, {});

    searchItems?.forEach(item => {
      if (!params[item.key]) {
        if (item.key === "tenderStatusArray") {
          params[item.key] = INIT_TENDER_STATUS;
        } else {
          params[item.key] = undefined;
        }
      }
    });
    if (
      !isEmpty(
        omit(
          omitBy(params, item => {
            return !item;
          }),
          "tenderStatusArray"
        )
      )
    ) {
      onSearch(params);
    }
  }, [searchList]);

  const onDelete = (index: number) => () => {
    setSearchList(searchList.filter((_, i) => i !== index));
  };

  return (
    <div>
      {searchList.length ? (
        <div className={styles.searchMenus}>
          <span>已选条件</span>
          <div className={styles.searchRow}>
            <div className={styles.searchLabel}>
              {searchList.map((item, index) => (
                <div className={styles.searchMenu} key={item.key}>
                  <span>
                    {item.typeTitle}: {item.label}
                  </span>
                  <CloseOutlined onClick={onDelete(index)} />
                </div>
              ))}
            </div>
            <div
              className={styles.clearAll}
              onClick={() => {
                setSearchList([]);
                onSearch(initSearch);
              }}
            >
              <DeleteOutlined />
              清除全部
            </div>
          </div>
        </div>
      ) : null}
      <div className={styles.searchBox}>
        {searchItems.map((searchItem, index) => (
          <div
            className={
              index === searchItems.length - 1
                ? `${styles.searchItem} ${styles.last}`
                : styles.searchItem
            }
            key={searchItem.key}
            style={{
              height: searchItem.openMore
                ? `${Math.ceil(searchItem.options.length / 14) * 60}px`
                : "60px"
            }}
          >
            <span>{searchItem.label}</span>
            <div className={styles.searchRow}>
              <div className={styles.searchLabel}>
                {searchItem.options.map((item: any) => (
                  <span
                    key={item.key}
                    className={
                      searchList.some(
                        data =>
                          data.type === searchItem.key && data.key === item.key
                      )
                        ? styles.active
                        : ""
                    }
                    onClick={addSearch(searchItem.key, item, searchItem.label)}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              {searchItem.options.length > 14 ? (
                <div
                  className={styles.searchRowMore}
                  onClick={() => {
                    const newArr = [...searchItems];
                    newArr[index].openMore = !newArr[index].openMore;
                    setSearchItems([...newArr]);
                  }}
                >
                  更多
                  {searchItem.openMore ? <UpOutlined /> : <DownOutlined />}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SearchHeader;
