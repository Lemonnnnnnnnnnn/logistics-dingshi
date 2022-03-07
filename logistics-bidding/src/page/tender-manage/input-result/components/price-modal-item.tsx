import { Input, Checkbox, Select, Row, InputNumber } from "antd";
import React, { useCallback, useEffect } from "react";
import TableX from "@/components/tableX";
import styles from "./index.scss";
import { cloneDeep, orderBy } from "lodash";
import {
  GOODS_UNITS_DICT,
  IPackageCorrelationItem,
  IBidderOfferConfirmItems,
  IBidderOfferItem,
  IDictionary,
  IBidderPackageEntitiesData
} from "@/declares";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { regNumber1, toChinesNum } from "@/utils/utils";

interface IProps {
  field: any;
  values: any;
  agrees?: IBidderOfferConfirmItems[];
  setAgrees?: (arr: IBidderOfferConfirmItems[]) => void;
  pageType?: string;
  priceSureList: any;
  setValues: (arr: any) => void;
}
const PriceModalItem: React.FunctionComponent<IProps> = ({
  field,
  values,
  setAgrees,
  agrees,
  pageType,
  priceSureList,
  setValues
}): JSX.Element => {
  const onChange = (type: string, i: number = field.name) => value => {
    const newList = cloneDeep(values);
    if (regNumber1.test(value)) {
      newList[field.name][i][type] = value;
    } else {
      newList[field.name][i][type] = 0;
    }
    setValues(newList);
  };

  useEffect(
    () => () => {
      setValues([]);
    },
    []
  );
  useEffect(() => {
    let newList = cloneDeep(values);
    if (pageType !== "lookSure") {
      const arr: any = [];
      priceSureList[field.name]?.packageCorrelationResps.forEach(item => {
        const obj = {
          tenderPackageId: undefined,
          packageCorrelationId: undefined,
          tenderBidderPackageId: undefined,
          taxNotContain: undefined,
          maximumCapacity: undefined,
          taxContain: undefined
        };
        obj.tenderPackageId = item.tenderPackageId;
        obj.packageCorrelationId = item.packageCorrelationId;
        obj.tenderBidderPackageId =
          priceSureList[
            field.name
          ].tenderBidderPackageEntity.tenderBidderPackageId;
        arr.push(obj);
      });

      priceSureList[field.name].bidderOfferItems = arr;
      newList = priceSureList.map(item => item.bidderOfferItems);

      if (setAgrees) {
        let newAgrees = cloneDeep(agrees);
        const data = priceSureList[field.name]?.packageCorrelationResps.map(
          item => ({
            packageCorrelationId: item.packageCorrelationId,
            tenderPackageId: item.tenderPackageId,
            offerConfirmation: undefined
          })
        );
        priceSureList[field.name].agrees = data;
        newAgrees = priceSureList.map(item => item.agrees);
        setAgrees(newAgrees);
      }
      setValues(newList);
    }
  }, [priceSureList]);

  const renderInputTd = (
    row: IPackageCorrelationItem,
    key: string,
    i: number
  ) => {
    const num =
      row.bidderOfferItems &&
      values.length &&
      values[field.name] &&
      values[field.name][i] &&
      values[field.name][i][key]
        ? Number(values[field.name][i][key]) -
          Number(row.bidderOfferItems[0][key])
        : 0;
    function renderTwo() {
      const initValue = values?.[field.name]?.[i]?.[key];

      const placeholder =
        key === "taxContain" && row.maxContain
          ? `限价${row.maxContain}`
          : key === "taxNotContain" && row.maxNotContain
          ? `限价${row.maxNotContain}`
          : undefined;

      const max =
        key === "taxContain" && row.maxContain
          ? row.maxContain
          : key === "taxNotContain" && row.maxNotContain
          ? row.maxNotContain
          : undefined;

      return (
        <div>
          <div style={{ display: "flex" }} className="tdWarp">
            <InputNumber
              value={initValue}
              onChange={onChange(key, i)}
              // 取第一次的限价
              placeholder={placeholder}
              max={max}
            />
            {values.length &&
            values[field.name] &&
            values[field.name][i] &&
            values[field.name][i][key] &&
            num !== 0 ? (
              <div
                style={{
                  marginLeft: "10px",
                  display: "flex",
                  alignItems: "center",
                  width: "50px"
                }}
              >
                {num > 0 ? (
                  <ArrowUpOutlined style={{ color: "#d81e06" }} />
                ) : (
                  <ArrowDownOutlined style={{ color: "#1afa29" }} />
                )}
                <span>{num.toFixed(2)}</span>
              </div>
            ) : (
              <div
                style={{
                  marginLeft: "10px",
                  display: "flex",
                  alignItems: "center",
                  width: "50px"
                }}
              >
                --
              </div>
            )}
          </div>
          {row.bidderOfferItems?.map(item => {
            return (
              <p key={item.tenderBidderOfferId} className="tdWarp">
                {/* 第{Number(item.offerTimes) + 1}次 {item[key]} */}
                {`第${toChinesNum(Number(item.offerTimes))}次  ${Number(
                  item[key]
                ).toFixed(2)}`}
              </p>
            );
          })}
        </div>
      );
    }

    function renderSurePage(
      bidderOfferItems: Array<IBidderOfferItem & IDictionary>
    ) {
      const renderList = [];
      // 把第一次报价找出来
      const onece = bidderOfferItems.find(item => item.offerTimes === 1);
      bidderOfferItems = bidderOfferItems.filter(item => item.offerTimes !== 1);
      // 把第一次报价push进报价列表最后一个
      bidderOfferItems.push(onece);
      for (let i = 0; i < bidderOfferItems.length; i++) {
        const currentRowNum = bidderOfferItems[i][key];
        let compareRender = null;

        if (i + 1 < bidderOfferItems.length) {
          const nextRowNum = bidderOfferItems[i + 1][key];
          const diffNum = Math.abs(currentRowNum - nextRowNum).toFixed(2);
          if (currentRowNum > nextRowNum) {
            compareRender = (
              <span className="ml-1">
                <ArrowUpOutlined style={{ color: "#d81e06" }} />
                <span>{diffNum}</span>
              </span>
            );
          }
          if (currentRowNum < nextRowNum) {
            compareRender = (
              <span className="ml-1">
                <ArrowDownOutlined style={{ color: "#1afa29" }} />
                <span>{diffNum}</span>
              </span>
            );
          }
        }

        const timesRender = (
          <div className="ml-1" key={bidderOfferItems[i].tenderBidderOfferId}>
            {(bidderOfferItems[i].offerTimes === 0 && `待确认  `) || null}
            {(bidderOfferItems[i].offerTimes !== 0 &&
              `第${toChinesNum(Number(bidderOfferItems[i].offerTimes))}次  `) ||
              null}
            {Number(bidderOfferItems[i][key]).toFixed(2)}
          </div>
        );
        // if((bidderOfferItems[i].offerTimes === 0 )
        renderList.push(
          <Row align="middle">
            {timesRender}
            {compareRender}
          </Row>
        );
      }

      return renderList.map(item => (
        <p key={Math.random()} className="tdWarp">
          {item}
        </p>
      ));
    }

    return row.bidderOfferItems ? (
      <>
        {(pageType === "two" && renderTwo()) || null}
        {(pageType === "sure" && renderSurePage(row.bidderOfferItems)) || null}
      </>
    ) : (
      "-"
    );
  };

  const searchFormList = (rowMessage, company) => {
    const { packageCorrelationId, tenderPackageId } = rowMessage;
    const { organizationId, tenderBidderId, tenderBidderPackageId } = company;

    const newList = cloneDeep(values);
    const currentPackage = newList?.[field.name] || [];
    const formData = currentPackage.find(
      formData =>
        formData.packageCorrelationId === packageCorrelationId &&
        formData.tenderPackageId === tenderPackageId &&
        formData.organizationId === organizationId &&
        formData.tenderBidderId === tenderBidderId &&
        formData.tenderBidderPackageId === tenderBidderPackageId
    );
    return { formData, newList };
  };

  const renderLookPriceInput = (row: any, key: string, index: number) => {
    const firstCandidate = row.bidderPackageDetailResps[0]; // 已在model中排序，第一候选人为数组第一位

    return row.bidderPackageDetailResps ? (
      <>
        {/* 循环当前货品的中标公司 */}
        {row.bidderPackageDetailResps.map((item, i) => {
          const firstCandidateBidderOfferItems =
            firstCandidate.bidderOfferItems;

          const firstCandidateValue = orderBy(
            firstCandidateBidderOfferItems,
            "offerTimes",
            "desc"
          )[0][key];

          const currentBidderOfferItems = item.bidderOfferItems;

          const currentValue = orderBy(
            currentBidderOfferItems,
            "offerTimes",
            "desc"
          )[0][key];

          // function searchFormList() {
          //   const { packageCorrelationId, tenderPackageId } = row
          //   const { organizationId, tenderBidderId, tenderBidderPackageId } = item

          //   const newList = cloneDeep(values);
          //   const currentPackage = newList?.[field.name] || []
          //   const formData = currentPackage.find(formData =>
          //     formData.packageCorrelationId === packageCorrelationId &&
          //     formData.tenderPackageId === tenderPackageId &&
          //     formData.organizationId === organizationId &&
          //     formData.tenderBidderId === tenderBidderId &&
          //     formData.tenderBidderPackageId === tenderBidderPackageId
          //   )
          //   return { formData, newList }
          // }

          function getFormData() {
            const { formData } = searchFormList(row, item);
            if (!formData) {
              return 0;
            } // 第一候选人没有表单信息，这是一个不会被用到的值
            return formData[key];
          }

          const onChangeLookPriceInput = (type: string) => value => {
            const { formData, newList } = searchFormList(row, item);
            formData[type] = value;
            setValues(newList);
          };

          // 当前填充input的价格
          const formValue = getFormData();

          // 当前公司报价和第一家公司对比的价差
          const num = formValue - currentValue;

          return i === 0 ? (
            <p className="tdWarp" key={item.tenderBidderPackageId}>
              {firstCandidateValue || "-"}
            </p>
          ) : (
            <div
              style={{ display: "flex" }}
              key={item.tenderBidderPackageId}
              className="tdWarp"
            >
              <InputNumber
                min={0}
                value={formValue}
                onChange={onChangeLookPriceInput(key)}
              />
              {num !== 0 ? (
                <div
                  style={{
                    marginLeft: "10px",
                    display: "flex",
                    alignItems: "center",
                    width: "50px"
                  }}
                >
                  {num > 0 ? (
                    <ArrowUpOutlined style={{ color: "#d81e06" }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: "#1afa29" }} />
                  )}
                  <span>{num.toFixed(1)}</span>
                </div>
              ) : (
                <div
                  style={{
                    marginLeft: "10px",
                    display: "flex",
                    alignItems: "center",
                    width: "50px"
                  }}
                >
                  --
                </div>
              )}
            </div>
          );
        })}
      </>
    ) : (
      "-"
    );
  };

  const renderMaximumCapacity = (row: any) => {
    return row.bidderPackageDetailResps.map((item, i) => {
      const currentBidderOfferItems = item.bidderOfferItems;
      const maximumCapacity = currentBidderOfferItems.find(
        item => item.maximumCapacity
      ).maximumCapacity;

      return (
        <p className="tdWarp" key={item.tenderBidderPackageId}>
          {maximumCapacity || "-"}
        </p>
      );
    });
  };

  const renderCheck = row => {
    const otherCompany = row?.bidderPackageDetailResps.slice(1) || [];
    const firstCandidate = <p>-</p>;
    const otherCandidate = otherCompany.map(item => {
      const { formData, newList } = searchFormList(row, item);
      return (
        <div key={item.tenderBidderId} className="tdWarp">
          <Checkbox
            checked={formData?.needSure}
            onChange={e => {
              formData.needSure = e.target.checked;
              // const newList = cloneDeep(values);
              // newList[field.name][index].needSure = e.target.checked;
              setValues(newList);
            }}
          />
        </div>
      );
    });

    return (
      <div className="tdWarp">
        {firstCandidate}
        {otherCandidate}
      </div>
    );
  };

  const columns = [
    {
      title: "线路",
      key: "index",
      width: 70,
      fixed: true,
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>
    },
    {
      title: "货品",
      key: "categoryName",
      render: (row: IPackageCorrelationItem) => (
        <div>
          {row.categoryName}-{row.goodsName}
        </div>
      )
    },
    {
      title: "提货点",
      width: 400,
      dataIndex: "deliveryAddress"
    },
    {
      title: "卸货点",
      width: 400,
      dataIndex: "receivingAddress"
    },
    {
      title: "计量单位 ",
      dataIndex: "goodsUnit",
      width: 90,
      render: (text: string) => <div>{GOODS_UNITS_DICT[text]}</div>
    },
    {
      title: "备选商家",
      width: 200,
      dataIndex: "bidderPackageDetailResps",
      className: "tdNoPadding",
      render: value => {
        return value
          ? value?.map(item => (
              <p key={item?.organizationId} className="tdWarp">
                {item.organizationName}
              </p>
            ))
          : "-";
      }
    },
    {
      title: "含税运费（元/计量单位）",
      className: "tdNoPadding",
      key: "taxContain",
      width: 200,
      render: (row: IPackageCorrelationItem, _, i: number) =>
        pageType === "lookSure"
          ? renderLookPriceInput(row, "taxContain", i)
          : renderInputTd(row, "taxContain", i)
    },
    {
      title: "不含税运费（元/计量单位）",
      key: "taxNotContain",
      className: "tdNoPadding",
      width: 200,
      render: (row: IPackageCorrelationItem, _, i: number) =>
        pageType === "lookSure"
          ? renderLookPriceInput(row, "taxNotContain", i)
          : renderInputTd(row, "taxNotContain", i)
    },
    {
      key: "offerConfirmation",
      title: (
        <div>
          <span style={{ color: "red", marginRight: 5 }}>*</span>
          <span>确认选项</span>
        </div>
      ),
      render: (_: IPackageCorrelationItem, __: any, index: number) => {
        return (
          <Select
            style={{ width: "100%" }}
            value={
              agrees && agrees.length && agrees[field.name]
                ? agrees[field.name][index]?.offerConfirmation
                : undefined
            }
            onChange={e => {
              if (setAgrees && agrees) {
                const newList = cloneDeep(agrees);
                newList[field.name][index]?.offerConfirmation = e;
                setAgrees(newList);
              }
            }}
          >
            {/* <Select.Option value={0}>待确认</Select.Option> */}
            <Select.Option value={1}>同意</Select.Option>
            <Select.Option value={2}>不同意</Select.Option>
          </Select>
        );
      }
    },
    {
      title: "预计月运输量",
      width: 120,
      className: "tdNoPadding",
      key: "maximumCapacity",
      render: (row: any, _, i: number) =>
        pageType === "lookSure" ? (
          renderMaximumCapacity(row)
        ) : (
          <div className="ml-3">
            {
              row.bidderOfferItems.find(item => item.offerTimes === 1)
                ?.maximumCapacity
            }
            {GOODS_UNITS_DICT[row.goodsUnit]}
          </div>
        )
    },
    {
      title: "备注",
      dataIndex: "remark"
    },
    {
      title: "需确认价格",
      key: "needSure",
      className: "tdNoPadding",
      render: (row: any, _: any, index: number) => {
        return renderCheck(row);
        // return (
        //   <>
        //     <p>-</p>
        //     {row.bidderPackageDetailResps &&
        //       row.bidderPackageDetailResps.slice(1).map((item, i) => {
        //         return (
        //           <div
        //             style={{ display: "flex" }}
        //             key={item.tenderBidderId}
        //             className="tdWarp"
        //           >
        //             <Checkbox
        //               checked={values?.[field.name]?.[index]?.needSure}
        //               onChange={e => {
        //                 const newList = cloneDeep(values);
        //                 newList[field.name][index].needSure = e.target.checked;
        //                 setValues(newList);
        //               }}
        //             />
        //           </div>
        //         );
        //       })}
        //   </>
        // );
      }
    }
  ];
  const currenColumns =
    pageType !== "two"
      ? pageType === "sure"
        ? columns.filter(
            item =>
              item.key !== "needSure" &&
              item.dataIndex !== "bidderPackageDetailResps"
          )
        : columns.filter(
            item =>
              item.dataIndex !== "remark" && item.key !== "offerConfirmation"
          )
      : columns.filter(
          item =>
            item.key !== "needSure" &&
            item.key !== "offerConfirmation" &&
            item.dataIndex !== "bidderPackageDetailResps"
        );

  return (
    <div className={styles.tableItem}>
      <div className={styles.tableTitle}>
        第
        {priceSureList[field.name]
          ? priceSureList[field.name]?.packageSequence
          : "-"}
        包 {priceSureList[field.name]?.tenderPackageTitle}
      </div>
      <TableX
        loading={false}
        rowKey="goodsId"
        scroll={{ x: "200%", y: 500 }} // 有左右滚动条
        dataSource={
          pageType === "lookSure"
            ? priceSureList[field.name]?.bidderPackageDetailResps
            : priceSureList[field.name]?.packageCorrelationResps
        }
        columns={currenColumns}
      />
    </div>
  );
};
export default PriceModalItem;
