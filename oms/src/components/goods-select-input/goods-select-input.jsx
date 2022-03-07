import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Modal, Input, message, Button } from 'antd';
import Table from '@/components/table/table';
import styles from './goods-select-input.less';

const GoodsSelectInput = ({ options, form, onSelect }) => {
  const [dataSource, setDataSource] = useState({ items: options || [], count: options.length || 0 });
  const [showModal, setShowModal] = useState(false);
  const [pageObj, setPageObj] = useState({ current: 1, pageSize: 10 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [searchObj, setSearchObj] = useState({ goodsFullName: undefined });
  const [inputValue, setInputValue] = useState(undefined);

  const onSelectRow = useCallback((selected) => {
    setSelectedRow([...selected]);
  }, [selectedRow]);

  const onOpenModalStatus = useCallback(() => {
    setShowModal(true);
  }, [showModal]);

  const onCancelModalStatus = useCallback(() => {
    setShowModal(false);
  }, [showModal]);

  useEffect(() => {
    setSelectedRow([]);
  }, [showModal]);

  const onOk = () => {
    if (selectedRow.length !== 1) {
      return message.info('请选择一条数据！');
    }
    const { categoryName, _categoryName, goodsName, materialQuality, specificationType } = selectedRow[0];
    setInputValue((categoryName || _categoryName) ? `${categoryName || _categoryName}-${goodsName}${materialQuality ? `(${materialQuality})` : ''}${specificationType ? `(${specificationType})` : ''}` : goodsName);
    form.setFieldsValue(selectedRow[0].goodsId);
    onSelect(selectedRow[0].goodsId);
    onCancelModalStatus();
  };

  const schema = {
    variable: true,
    minWidth: 1000,
    columns: [
      {
        title: '货品名称',
        render: (text, record) => <div>{record.categoryName}-{record.goodsName}</div>,
      },
      {
        title: '货品类目',
        dataIndex: 'categoryName',
      },
      {
        title: '品牌名称',
        dataIndex: 'goodsName',
      },
      {
        title: '规格型号',
        dataIndex: 'specificationType',
      },
      {
        title: '材质',
        dataIndex: 'materialQuality',
      },
      {
        title: '包装方式',
        dataIndex: 'packagingMethod',
        render:(text)=> {
          if(Number(text) === 1) return '袋装'
          if(Number(text) === 2) return '散装'
        }
      },
    ],
  };

  const onChange = (val) => {
    const { current, pageSize } = val;
    setPageObj({ current, pageSize });
  };

  const onSearch = useCallback((val) => {
    setSearchObj({ ...val });
    setPageObj({ current: 1, pageSize: 10 });
  }, [searchObj]);

  useEffect(() => {
    const { goodsFullName } = searchObj;

    if (goodsFullName) {
      const newDataSource = (options || []).filter(item => {
        const fullName = `${item.categoryName}-${item.goodsName}`;
        return fullName.indexOf(goodsFullName) !== -1;
      });
      setDataSource({ items: newDataSource, count: newDataSource.length });
    } else {
      setDataSource({ items: options || [], count: options.length || 0 });
    }

  }, [searchObj]);

  const buttonList = useMemo(() => [
    {
      label: '查询',
      btnType: 'primary',
      key: 'search',
      type: 'search',
      onClick: onSearch,
    },
    {
      label: '重置',
      key: 'reset',
      type: 'search',
      onClick: onSearch,
      params: ['goodsFullName'],
    },
  ], []);

  const searchList = useMemo(() => (
    [
      {
        label: '货品名称',
        placeholder: '请输入货品名称',
        key: 'goodsFullName',
        type: 'input',
      },
    ]), []);

  return (
    <div>
      <Modal
        destroyOnClose
        maskClosable={false}
        className={styles.goodsSelectInput}
        visible={showModal}
        title='请选择常用货品'
        onCancel={onCancelModalStatus}
        onOk={onOk}
      >
        <Table
          rowKey='goodsId'
          dataSource={dataSource}
          pagination={pageObj}
          searchList={searchList}
          buttonList={buttonList}
          schema={schema}
          onSelectRow={onSelectRow}
          multipleSelect
          onChange={onChange}
        />
      </Modal>
      <Input value={inputValue} placeholder='请选择常用货品' onClick={onOpenModalStatus} />
    </div>
  );
};

export default GoodsSelectInput;
