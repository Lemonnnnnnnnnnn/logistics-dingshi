import React, { useState, useCallback } from "react";
import styles from "./index.scss";
import Sort from '@/assets/imgs/home/sort.png'
import SortDefault from '@/assets/imgs/home/sort-default.png'
import { IDictionary, IStoreProps } from "@/declares";
import { connect } from "dva";
import { Checkbox } from 'antd'
import { getLoginUrl } from "@/utils/utils";


const nameDict: IDictionary = {
  0: 'orderByTenderPublicTime',
  1: 'orderByOfferEndTime'
}

// 是否根据当前key值排列
const valueDict: IDictionary = {
  0: undefined,
  1: true,
  2: true
}

interface IProps extends IStoreProps {
  onSearch: (val: any) => void;
  setViewMyself?: (val: boolean) => void;
}

const SearchBar: React.FC<IProps> = ({ 
  onSearch, 
  setViewMyself,
  commonStore: { userInfo }, 
}): JSX.Element => {
  // 0 未启用 1 降序 2 升序
  const [current, setCurrent] = useState([0, 0])
  const isLogin = !!userInfo.accessToken;

  const onChange = useCallback(
    (type: number) => () => {
      let newCurrent = [0, 0]
      let isDescendingOrder = true
      switch (current[type]) {
        case 0: {
          newCurrent[type] = 1
          break;
        }
        case 1: {
          newCurrent[type] = 2
          isDescendingOrder = false
          break;
        }
        case 2: {
          newCurrent[type] = 1
          break;
        }
      }

      setCurrent(newCurrent)
      const params: any = {
        orderByTenderPublicTime: undefined,
        orderByOfferEndTime: undefined,
        isDescendingOrder, // 是否按降序排列
      }
      params[nameDict[type]] = valueDict[newCurrent[type]]
      onSearch(params);

    },
    [current]
  );

  const onChangeCheck = useCallback((val: any) => {
    if (val.target.checked === true && !isLogin) {
      return (window.location.href = getLoginUrl());
    }
    if (setViewMyself) setViewMyself(val.target.checked);
  }, []);

  return (
    <div className={styles.sortBar}>
      <span>排序：</span>
      <span
        className={current[0] ? styles.active : ""}
        onClick={onChange(0)}
      >
        信息发布时间
        {current[0] === 0 && <img style={{ width: 20, marginLeft: 3 }} src={SortDefault} /> || null}
        {current[0] === 1 && <img style={{ width: 20, transform: 'rotate(180deg)', marginLeft: 3 }} src={Sort} /> || null}
        {current[0] === 2 && <img style={{ width: 20, marginLeft: 3 }} src={Sort} /> || null}

      </span>
      <span
        className={current[1] ? styles.active : ""}
        onClick={onChange(1)}
      >
        信息截止时间
        {current[1] === 0 && <img style={{ width: 20, marginLeft: 3 }} src={SortDefault} /> || null}
        {current[1] === 1 && <img style={{ width: 20, transform: 'rotate(180deg)', marginLeft: 3 }} src={Sort} /> || null}
        {current[1] === 2 && <img style={{ width: 20, marginLeft: 3 }} src={Sort} /> || null}
      </span>

      {setViewMyself && <div style={{ float: "right" }}>
        <Checkbox onChange={onChangeCheck}>只看与我相关</Checkbox>
      </div> || null
      }
    </div>
  );
};

const mapStoreToProps = ({ commonStore }: IStoreProps) => ({
  commonStore
});
export default connect(mapStoreToProps)(SearchBar);


// export default SearchBar;
