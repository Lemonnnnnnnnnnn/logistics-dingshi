import React from "react";
import styles from "./index.scss";
import { IAuthBidderInfo, IPackageCorrelationResultItem } from "@/declares";
import TableX from "@/components/tableX";

interface IProps {
  authBidderInfo: IAuthBidderInfo;
}

const ResultDetailContent: React.FC<IProps> = ({
  authBidderInfo
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
      dataIndex: "taxContain"
    },
    {
      title: "不含税运费（元/计量单位）",
      dataIndex: "taxNotContain"
    }
  ];
  return (
    <div className={styles.noticeDetailContentLeft}>
      <div className={styles.noticeDetailContentTitle}>
        <span>{authBidderInfo.tenderTitle}</span>
        {authBidderInfo.tenderType === 1 && <span>项目招标评标工作已经结束，中标人已经确定。现将结果公布如下：</span> || null}
        {authBidderInfo.tenderType === 2 && <span>项目询价工作已经结束，现将结果公布如下：</span> || null}
      </div>
      <div className={styles.noticeDetailContentPackage}>
        {authBidderInfo.bidderPackageItems?.map((item, key) => (
          <div key={item.tenderPackageId} className="mt-2">
            <h3 className="text-bold">
              第{item?.packageSequence}包 {item.tenderPackageTitle}优选供应商
            </h3>

            {item.bidderOrgItems?.map(_item => (
              <div style={{ marginTop: 20 }}>
                <p key={_item.tenderPackageId}>{_item.organizationName}</p>
                <TableX
                  columns={columns}
                  dataSource={_item.packageCorrelationItems?.map(
                    (__item, __key) => ({ ...__item, index: __key + 1 })
                  )}
                  loading={false}
                  rowKey="packageCorrelationId"
                />
              </div>
            )) || <span style={{ color: 'red' }} className="text-large">流标</span>}
          </div>
        ))}
      </div>

      <h3 className="mt-2">评标说明</h3>
      {authBidderInfo.tenderEvaluationResult}
    </div>
  );
};
export default ResultDetailContent;
