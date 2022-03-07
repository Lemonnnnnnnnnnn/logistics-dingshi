import { Form, Modal, DatePicker, message } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.scss";
import PriceModalItem from "./price-modal-item";
import { History } from "history";
import { IStoreProps, ITenderManageStoreProps } from "@/declares";
import { connect } from "dva";
import { putConfirmPrice } from "@/services/tender-manage-server";
import dayjs from "dayjs";
import { orderBy } from "lodash";
import { ConsoleSqlOutlined } from "@ant-design/icons";

interface IProps {
  visible: boolean;
  getTenderMainDetail: (tenderId: number) => void;
  tenderManageStore: ITenderManageStoreProps;
  tenderId: number;
  history: History;
  setVisible: (bool: boolean) => void;
}

const PriceModal: React.FunctionComponent<IProps> = ({
  visible,
  getTenderMainDetail,
  tenderManageStore: { tenderMainDetail },
  history,
  tenderId,
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  const [values, setValues] = useState<any[]>([]);
  const handleOk = useCallback(() => {
    form.validateFields().then(data => {
      const confirmPriceDetailReqs = values.reduce((r, n) => {

        n?.forEach(element => {
          if (element.needSure) {
            r.push(element);
          }
        });
        return r;
      }, []);
      if (confirmPriceDetailReqs.length < 1) {
        return message.info("至少选择一个确认价格！");
      }

      putConfirmPrice(tenderId, {
        priceConfirmTime: dayjs(data.priceConfirmTime).format(
          "YYYY/MM/DD HH:mm:ss"
        ),
        confirmPriceDetailReqs
      }).then(res => {
        message.success("发起价格确认成功！");
        setVisible(false);
        history.push("/tenderManage");
      });
    });
  }, [visible, values]);
  useEffect(() => {
    getTenderMainDetail(tenderId);
  }, []);

  useEffect(() => {
    if (tenderMainDetail) {
      form.setFieldsValue({
        tableList: tenderMainDetail.tenderPackageEntities
      });
    }
  }, [tenderMainDetail]);

  const priceSureList = useMemo(() => {
    const tenderPackageEntities = tenderMainDetail?.tenderPackageEntities || []
    const tableList = tenderPackageEntities.reduce((list: any[], packageMsg, currentIndex) => {
      const formDataList: any[] = []

      const goods = packageMsg.bidderPackageDetailResps
      goods?.forEach((bidderPackageDetail: any, i) => {
        // 公司信息  bidderPackageDetail.bidderPackageDetailResps
        const companys = bidderPackageDetail.bidderPackageDetailResps
        if (companys) {

          const firstBidderBidderOfferItems = companys[0]?.bidderOfferItems // 已在model中按候选人顺序对公司数组进行排序

          const taxContain = orderBy(firstBidderBidderOfferItems, 'offerTimes', 'desc')[0]['taxContain']
          const taxNotContain = orderBy(firstBidderBidderOfferItems, 'offerTimes', 'desc')[0]['taxNotContain']

          let formData = {}

          const otherCompanys = companys.slice(1)

          otherCompanys
            ?.forEach((item) => {
              formData = {
                ...formData, tenderPackageId: bidderPackageDetail.tenderPackageId,
                tenderBidderPackageId: item?.tenderBidderPackageId,
                tenderBidderId: item?.tenderBidderId,
                organizationId: item?.organizationId,
                taxContain,
                taxNotContain,
                needSure: true,
                packageCorrelationId: bidderPackageDetail.packageCorrelationId
              }

              // formData.tenderBidderId = item.tenderBidderId;
              // formData.tenderBidderPackageId = item.tenderBidderPackageId;
              // formData.organizationId = item?.organizationId;
              formDataList.push(formData)
              tenderPackageEntities[currentIndex].bidderOfferItems = formData
            });

        }
      })
      list.push(formDataList)

      return list
    }, [])

    setValues(tableList)
    return tenderPackageEntities
  }, [tenderMainDetail])


  return (
    <Modal
      title="价格确认"
      visible={visible}
      onOk={handleOk}
      className={`modal ${styles.priceModal}`}
      width={1100}
      centered
      onCancel={() => {
        setVisible(false);
        form.resetFields();
      }}
    >
      <Form form={form}>
        <Form.Item name={"priceConfirmTime"} label="请输入价格确认截止时间">
          <DatePicker
            showTime
            disabledDate={current => current && current < dayjs()}
          />
        </Form.Item>
        <p style={{ color: "#999" }}>
          （提示：超过该时间未操作的商家将默认为不确认该价格）
        </p>
        <Form.List name="tableList">
          {fields => (
            <>
              {fields.map((field, index) => (
                <PriceModalItem
                  key={field.key}
                  field={field}
                  values={values}
                  setValues={setValues}
                  pageType="lookSure"
                  // priceSureList={tenderMainDetail?.tenderPackageEntities}
                  priceSureList={priceSureList}
                />
              ))}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};
const mapStoreToProps = ({ tenderManageStore, loading }: IStoreProps) => ({
  tenderManageStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getTenderMainDetail: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getTenderMainDetail",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(PriceModal);
