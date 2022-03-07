import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Switch, Divider, Icon } from 'antd';
import { SchemaForm, Item, FormButton, FORM_MODE, Observer } from '@gem-mine/antd-schema-form';
import RenderSearchInput from '../../../components/Table/SearchForm';
import { getLocal, isEmpty } from "../../../utils/utils";
import styles from './index.less';

const initData = {
  pageObj: { current: 1, pageSize: 10 },
  searchObj: { projectId: undefined, transportNo: undefined, carNo: undefined, tangibleBillStatuses: undefined, tangibleBillNo: undefined }
};

const GeneralTemplate = ({ getTrackRecordList, tabs, activeKey, history }) => {
  const currentTab = tabs.find(item => item.id === activeKey);
  // 获取本地是否有初始化数据
  const localData = getLocal(currentTab.id);

  // 如果有就去本地的如果没有就用自己定义的
  const [pageObj, setPageObj] = useState(localData && !isEmpty(localData.pageObj) ? localData.pageObj : initData.pageObj);
  const [searchObj, setSearchObj] = useState(localData && !isEmpty(localData.searchObj) ? localData.searchObj : initData.searchObj);

  useEffect(() => {
    getData();
    return () => {
      // 页面销毁的时候自己 先移除原有的 再存储最新的
      localStorage.removeItem(currentTab.id);
      if (getLocal('local_commonStore_tabsObj').tabs.length > 1) {
        localStorage.setItem(currentTab.id, JSON.stringify({ searchObj, pageObj }));
      }
    };
  }, [pageObj, searchObj]);

  const getData =  useCallback((params = {}) => {
    const data = {
      limit: params.limit || pageObj.pageSize,
      offset: params.current ? pageObj.pageSize * ( params.current - 1 ) : pageObj.pageSize * ( pageObj.current - 1 ),
      ...searchObj,
    };
    getTrackRecordList(data);
  }, [pageObj, searchObj]);
  const searchList = useMemo(() => ([{
    label: '业务类别',
    placeholder: '请输入业务类别名称',
    key: 'transportNo',
    value: searchObj.transportNo,
    type: 'input',
  },  {
    label: '业务模版名称',
    placeholder: '请输入业务模板名称',
    key: 'transportNo',
    value: searchObj.transportNo,
    type: 'input',
  }, {
    label: '业务模版描述',
    placeholder: '请输入业务模板描述关键字',
    key: 'carNo',
    value: searchObj.carNo,
    type: 'input',
  }]), [searchObj]);

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
  }, []);

  const buttonList = useMemo(() => [{
    label: '查询',
    btnType: "primary",
    key: 'search',
    type: "search",
    onClick: onSearch,
  }, {
    label: '重置',
    key: 'reset',
    onClick: onSearch,
    params : searchList.map(item => item.key)
  }
  ], []);
  return (
    <div className={styles.generalTemplate}>
      <RenderSearchInput searchObj={searchObj} searchList={searchList} buttonList={buttonList} />
      <p>共计搜索到5个符合条件的模板。</p>
      <div className={styles.generalContent}>
        <div className={styles.generalContentItem}>
          <div className={styles.generalAdd}>
            <Icon type="plus" style={{ fontSize: "40px", textAlign: "center" }} onClick={() => history.push("businessTypeSetting/add", { pageType: FORM_MODE.ADD })} />
            <p>请添加平台预制模板。。</p>
          </div>

        </div>
        <div className={styles.generalContentItem}>
          <div className={styles.generalContentItemHeader}>
            <div>
              <img src="" alt="" />
              <span>title</span>
            </div>
            <div><Switch defaultChecked checkedChildren="启" unCheckedChildren="停"  /></div>
          </div>
          <div className={styles.generalContentItemCount}>
            <div>
              <span>关联项目数</span>
              <span>34个</span>
            </div>
            <div>
              <span>累计模板采用数</span>
              <span>34个次</span>
            </div>
          </div>
          <div className={styles.generalContentItemFont}>
            <span>v3.0.2</span>
            <span>描述</span>
          </div>
          <Divider />
          <div className={styles.generalContentItemBtn}>
            <span onClick={() => history.push("businessTypeSetting/update", { pageType: FORM_MODE.MODIFY })}><Icon type="edit" /> 编辑</span>
            <span onClick={() => history.push("businessTypeSetting/detail", { pageType: FORM_MODE.DETAIL })}><Icon type="file" /> 详情</span>
          </div>
          <div className={styles.generalContentItemTime}>
            <span>最近更新人：舒服舒服</span>
            <span>更新时间：舒服舒服</span>
          </div>
        </div>
      </div>
    </div>
  );
};
const mapDispatchToProps = (dispatch) => ({
  getTrackRecordList: (params) => dispatch({ type: 'trackRecordSheetStore/getTrackRecordList', payload: params }),
});

export default connect(({ trackRecordSheetStore, commonStore, loading }) => ({
  loading,
  ...trackRecordSheetStore,
  ...commonStore,
}), mapDispatchToProps)(GeneralTemplate);
