import React, { useEffect, useCallback } from "react";
import { Form, Button, message, Spin } from "antd";
import { Location, History } from "history";
import CommonHeader from "../components/common-header";
import RetreatItem from "./components/retreat-item";
import { IStoreProps, ITenderManageStoreProps } from "@/declares";
import { connect } from "dva";
import { putRefundEarnestMoney } from "@/services/tender-manage-server";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderNo: string;
    tenderId: number;
  };
}
interface IProps {
  location: ILocation;
  history: History;
  tenderId: number;
  loading: any;
  tenderManageStore: ITenderManageStoreProps;
  getRefundAuditList: (tenderId: number) => void;
}

const Index: React.FC<IProps> = ({
  location: {
    state: { tenderTitle, tenderNo, tenderId }
  },
  history,
  loading,
  getRefundAuditList,
  tenderManageStore: { refundEarnestMoneyList }
}) => {
  const [form] = Form.useForm();
  // const isLoading = loading.effects["tenderManageStore/getRefundAuditList"];
  useEffect(() => {
    getRefundAuditList(tenderId);
  }, []);
  useEffect(() => {
    form.setFieldsValue({ packageList: refundEarnestMoneyList });
  }, [refundEarnestMoneyList]);
  const onSubmit = useCallback(() => {
    form.validateFields().then(values => {
      const params = values.packageList.map(item => ({
        tenderBidderId: item.tenderBidderId,
        remarks: item?.remarks,
        isConsentRefund: item.isConsentRefund
      }));
      putRefundEarnestMoney(tenderId, params).then(res => {
        message.success("退保审核成功！");
        history.push("/tenderManage");
      });
    });
  }, []);
  return (
    <Spin tip="Loading..." spinning={false}>
      <div className="center-main border-gray">
        <CommonHeader
          tenderTitle={tenderTitle}
          tenderNo={tenderNo}
          history={history}
          tenderId={tenderId}
        />
        <div className="m-2">
          <Form form={form}>
            <Form.List name="packageList">
              {fields => (
                <>
                  {fields.map(field => (
                    <RetreatItem key={field.key} dataItem={field} form={form} />
                  ))}
                </>
              )}
            </Form.List>
          </Form>
          <div className="commonBtn">
            <Button type="primary" onClick={onSubmit}>
              提交
            </Button>
            <Button onClick={() => history.push("/tenderManage")}>取消</Button>
          </div>
        </div>
      </div>
    </Spin>
  );
};
const mapStoreToProps = ({ tenderManageStore, loading }: IStoreProps) => ({
  tenderManageStore,
  loading
});
const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: { tenderId: number } }) => any
) => ({
  getRefundAuditList: (tenderId: number) =>
    dispatch({
      type: "tenderManageStore/getRefundAuditList",
      payload: { tenderId }
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(Index);
