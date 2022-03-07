import React, { useMemo } from "react";
import TableX from "@/components/tableX";
import styles from "./index.scss";
import { GOODS_UNITS_DICT, IPackageCorrelationResultItem } from "@/declares";
import { ITenderMainDetail } from "@/declares/tender-manage/bidEvaluationResults";
import { Input } from "antd";
import { ITenderPackageEntities } from "@/declares/tender-manage/tenderMainDetail";
import { orderBy } from "lodash";

interface IProps {
  print?: boolean;
  bidEvaluationResults: ITenderMainDetail;
}

const BidEvaluationResultItem: React.FunctionComponent<IProps> = ({
  bidEvaluationResults
}): JSX.Element => {
  const columns = [
    {
      title: "线路",
      key: "index",
      fixed: true,
      width: 70,
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>
    },
    {
      title: "货品",
      fixed: true,
      width: 150,
      // dataIndex: "goodsName",
      render: (text, record: IPackageCorrelationResultItem) => {
        return (
          <div>
            {record.categoryName}-{record.goodsName}
          </div>
        );
      }
    },
    {
      title: "计量单位",
      dataIndex: "goodsUnit",
      width: 100,
      render: (text: number) => GOODS_UNITS_DICT[text]
    },
    {
      title: "提货点",
      width: 150,
      dataIndex: "deliveryName"
    },
    {
      title: "卸货点",
      width: 150,
      dataIndex: "receivingName"
    },
    {
      title: "含税运费（元/计量单位）",
      dataIndex: "taxContain",
      width: 120
    },
    {
      title: "不含税运费（元/计量单位）",
      dataIndex: "taxNotContain",
      width: 120
    },
    {
      title: "预计月最大运输量",
      dataIndex: "maximumCapacity",
      width: 120,
      render: (text: any, record: any) =>
        `${text}${GOODS_UNITS_DICT[record.goodsUnit]}`
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 200,
    }
  ];

  const renderEvalutionDetail = (bidderPackage: ITenderPackageEntities) => {
    if (bidderPackage.isAbortive) {
      return (
        <div style={{ color: "red" }} className="mt-2 mb-2 ml-3 text-large">
          流标
        </div>
      );
    }
    // 筛除不是候选人的公司 
    const filterBidderPackageDetailResps = bidderPackage.bidderPackageDetailResps.filter(item => item.bidderSequence)
    const newBidderPackageDetailResps = orderBy(
      filterBidderPackageDetailResps,
      "bidderSequence",
      "asc"
    );

    const transportPriceRender = (packageCorrelationResps) => {
      return packageCorrelationResps.map((packageCorrelation, key) => {
        const bidderOfferItems = packageCorrelation?.bidderOfferItems || []
        const taxContain = orderBy(bidderOfferItems, 'offerTimes', 'desc')[0]['taxContain']
        const taxNotContain = orderBy(bidderOfferItems, 'offerTimes', 'desc')[0]['taxNotContain']
        const maximumCapacity = bidderOfferItems.find(bidder => bidder.maximumCapacity).maximumCapacity
        const remark = bidderOfferItems.find(bidder => bidder?.remark)?.remark
        return {
          ...packageCorrelation,
          index: key + 1,
          taxContain,
          taxNotContain,
          maximumCapacity,
          remark
        }
      })
    }

    const bidderMessageRender = (BidderPackageDetail, key) => {
      const candidate = (
        <span className="text-bold">
          第{BidderPackageDetail.bidderSequence}
          候选人
        </span>
      )
      const organizationName = <span className="ml-3">{BidderPackageDetail.organizationName}</span>
      const winBidder = (
        BidderPackageDetail.tenderBidderPackageStatus ? (
          <span
            className="ml-3"
            style={{
              color: "red"
            }}
          >
            中标
          </span>
        ) : null
      )
      const priceConfirm = () => {
        const packageCorrelationResps = BidderPackageDetail?.packageCorrelationResps || []
        // 价格确认只要有确认一定是都确认了，所以取第一个货品判断
        const bidderOfferItems = packageCorrelationResps?.[0]?.bidderOfferItems || []
        const priceConfirmBidder = bidderOfferItems.find(bidder => bidder.offerTimes === 0)
        console.log(priceConfirmBidder)

        if (priceConfirmBidder?.offerConfirmation === 0) {
          return (
            <span style={{
              color: "red"
            }}>(价格未确认)</span>
          )
        } else {
          return null
        }
      }

      return (
        <div className="mb-2 mt-2">
          {candidate}
          {organizationName}
          {winBidder}
          {priceConfirm()}
        </div>
      )
    }

    return newBidderPackageDetailResps.map((_item, _key) => {
      return (
        <div key={_item.tenderBidderPackageId}>
          {bidderMessageRender(_item, _key)}
          {/* <div className="mb-2 mt-2">
            <span className="text-bold">
              第{_item.bidderSequence}
              候选人
            </span>
            <span className="ml-3">{_item.organizationName}</span>
            {_item.tenderBidderPackageStatus ? (
              <span
                className="ml-3"
                style={{
                  color: "red"
                }}
              >
                中标
              </span>
            ) : null}
          </div> */}
          <TableX
            columns={columns}
            dataSource={transportPriceRender(_item.packageCorrelationResps)}
            loading={false}
            rowKey="packageCorrelationId"
          />
        </div>
      );
    });
  };

  const candidateRender = useMemo(
    () => (
      <>
        <div>
          {/*<div className="mt-2 mb-2 text-large">*/}
          {/*  {bidEvaluationResults.tenderTitle}*/}
          {/*  项目招标评标工作已经结束，中标人已经确定。现将结果公布如下：*/}
          {/*</div>*/}
          <div className={styles.noticeDetailContentPackage}>
            {bidEvaluationResults.tenderPackageEntities.map((item, key) => (
              <div key={item.tenderPackageId} className="text-large mb-2">
                <div>
                  第{item?.packageSequence}包 {item.tenderPackageTitle}
                </div>
                <div className="mt-2 mb-2 text-bold">评标结果：</div>
                {renderEvalutionDetail(item)}
              </div>
            ))}
          </div>

          <h3 className="mt-2">评标说明</h3>
          <Input.TextArea
            disabled
            value={bidEvaluationResults.tenderEvaluationResult || "-"}
          />
        </div>
      </>
    ),
    []
  );
  return <div className={styles.bidResultItem}>{candidateRender}</div>;
};

export default BidEvaluationResultItem;
