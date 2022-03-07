import React from "react";
import styles from "./index.scss";
import { History } from "_@types_history@4.7.9@@types/history";
import {
  GOODS_UNITS_DICT,
  IPublicBidderDetailReqs,
  IUserInfo
} from "@/declares";
import UploadX from "@/components/uploadX";
import NotLoginRenderText from "@/components/notLoginRender/text";

interface IProps {
  history: History;
  noticeDetail: IPublicBidderDetailReqs;
  userInfo: IUserInfo;
  isLogin: boolean;
}

const NoticeDetailHeader: React.FC<IProps> = ({
  history,
  noticeDetail,
  userInfo,
  isLogin
}): JSX.Element => {
  return (
    <div className={styles.noticeDetailContentLeft}>
      <div className={styles.noticeDetailPackageList}>
        {isLogin ? (
          <div className={styles.noticeDetailContentPackage}>
            {noticeDetail.tenderPackageEntities?.map((item, key) => (
              <div
                className="mb-3"
                key={item.tenderPackageId}
                style={{ marginTop: 20 }}
              >
                <h3>
                  第{key + 1}包 <span>{item.tenderPackageTitle}</span>
                </h3>
                {item.packageCorrelationResps?.map((_item, _key) => (
                  <div key={_item.packageCorrelationId}>
                    <div className={styles.noticeDetailPackageTitle}>
                      运输线路{_key + 1}
                    </div>
                    <p className="fontP">
                      <span>货品名称：</span>
                      <span>
                        {_item.categoryName}-{_item.goodsName}
                        {/* {_item.specificationType}-{_item.materialQuality} */}
                      </span>
                    </p>
                    <p className="fontP">
                      <span>提货点：</span>
                      <span>{_item.deliveryAddress}</span>
                    </p>
                    <p className="fontP">
                      <span>卸货点：</span>
                      <span>{_item.receivingAddress}</span>
                    </p>
                    {_item.maxContain ? (
                      <p className="fontP">
                        <span>最高限价（含税运费）：</span>
                        <span>
                          {_item.maxContain}元/
                          {GOODS_UNITS_DICT[_item.goodsUnit]}
                        </span>
                      </p>
                    ) : null}
                    {_item.maxNotContain ? (
                      <p className="fontP">
                        <span>最高限价（不含税运费）：</span>
                        <span>
                          {_item.maxNotContain}元/
                          {GOODS_UNITS_DICT[_item.goodsUnit]}
                        </span>
                      </p>
                    ) : null}
                    <p className="fontP">
                      <span>预计运输量：</span>
                      <span>
                        {_item.estimateTransportVolume}
                        {GOODS_UNITS_DICT[_item.goodsUnit]}
                      </span>
                    </p>
                  </div>
                ))}
                {item?.remark ? (
                  <p className="fontP">
                    <span>其它要求/说明：</span>
                    <span>{item?.remark}</span>
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h2>包件信息</h2>
            <NotLoginRenderText />
          </div>
        )}
      </div>
      <div className={`wrapBox ${styles.noticeDetailEnclosure}`}>
        <h2>项目附件</h2>
        {/*<p>关于福陆排污撬块发货运输的招标文件.word</p>*/}
        {isLogin ? (
          <UploadX
            showDownload={true}
            disable={true}
            showList={noticeDetail.tenderDentryid?.split(",") || []}
          />
        ) : (
          <NotLoginRenderText />
        )}
      </div>
    </div>
  );
};
export default NoticeDetailHeader;
