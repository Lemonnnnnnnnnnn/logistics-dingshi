import { Form, Input, message, Modal, Radio, Select } from "antd";
import React, { useCallback, useEffect } from "react";
import { connect } from "dva";
import { regNumber1 } from "../../../../utils/utils";
import MapInput from "../../../../components/map-input";
import UploadX from "../../../../components/uploadX";
import {
  IDeliveriesParams,
  IOrganizationsParams,
  IReceivingParams,
  IStoreProps,
  UpdateType,
  ICommonStoreProps
} from "../../../../declares";
import {
  postDeliveries,
  postReceivings
} from "@/services/tender-manage-server";

interface IProps {
  visible: boolean;
  getReceivingList: (params: IReceivingParams) => void;
  getDeliveriesList: (params: IDeliveriesParams) => void;
  getOrganizationsList: (params: IOrganizationsParams) => void;
  goodsTypeVisible: number;
  commonStore: ICommonStoreProps;
  setVisible: (bool: boolean) => void;
}

const { TextArea } = Input;

const AddGoodsModal: React.FunctionComponent<IProps> = ({
  visible,
  getDeliveriesList,
  getReceivingList,
  goodsTypeVisible,
  commonStore,
  getSupplierList,
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  useEffect(() => {
    getSupplierList({
      organizationType: goodsTypeVisible ? 7 : 6,
      selectType: 1,
      auditStatus: 1,
      isAvailable: 1,
      offset: 0,
      limit: 1000
    });
  }, []);
  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      if (goodsTypeVisible) {
        postReceivings({
          ...values,
          signDentryid: values.signDentryid.join(",")
        }).then(() => {
          message.success("添加提货点成功！");
          setVisible(false);
          getReceivingList({ limit: 1000, offset: 0, isAvailable: 1 });
        });
      } else {
        postDeliveries({ ...values }).then(() => {
          message.success("添加提货点成功！");
          setVisible(false);
          getDeliveriesList({ limit: 1000, offset: 0, isAvailable: 1 });
        });
      }
    });
  }, [visible]);
  return (
    <Modal
      title={goodsTypeVisible ? "添加卸货点" : "添加提货点"}
      visible={visible}
      onOk={handleOk}
      className="modal"
      width={800}
      centered
      onCancel={() => {
        setVisible(false);
        form.resetFields();
      }}
    >
      <Form form={form}>
        <Form.Item
          name={goodsTypeVisible ? "receivingName" : "deliveryName"}
          label={goodsTypeVisible ? "卸货点名称" : "提货点名称"}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={goodsTypeVisible ? "customerOrgId" : "supplierOrgId"}
          label={goodsTypeVisible ? "卸货单位" : "供应商"}
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              option!.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {commonStore.supplierList.items.map(item => (
              <Select.Option
                value={item?.organizationId}
                key={item?.organizationId}
              >
                {item.organizationName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="contactName"
          label={goodsTypeVisible ? "卸货联系人（选填）" : "提货联系人（选填）"}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="contactPhone"
          label={
            goodsTypeVisible ? "卸货联系电话（选填）" : "提货联系电话（选填）"
          }
        >
          <Input />
        </Form.Item>
        <MapInput
          placeholder="地址"
          title={goodsTypeVisible ? "卸货地址" : "提货地址"}
          name="district"
          submitKey="areaCode"
          relationKey={
            goodsTypeVisible ? "receivingAddress" : "deliveryAddress"
          }
          latKey={goodsTypeVisible ? "receivingLongitude" : "deliveryLongitude"}
          longKey={goodsTypeVisible ? "receivingLatitude" : "deliveryLatitude"}
          form={form}
          rules={[{ required: true }]}
        />
        <Form.Item
          name={goodsTypeVisible ? "receivingAddress" : "deliveryAddress"}
          label={goodsTypeVisible ? "卸货地址详细描述" : "提货地址详细描述"}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="remarks" label="备注">
          <TextArea rows={4} />
        </Form.Item>
        {goodsTypeVisible ? (
          <>
            <Form.Item
              name="signDentryid"
              label="样签（选填）"
              rules={[{ required: true, message: "请上传样签！" }]}
            >
              <UploadX
                onUpload={res => {
                  const old = form.getFieldValue("signDentryid") || [];
                  form.setFieldsValue({ signDentryid: [...old, res] });
                }}
                title="样签"
                renderMode={UpdateType.Img}
                accept="image/jpeg, image/jpg, image/png"
                fileSuffix={["jpeg", "jpg", "png"]}
              />
            </Form.Item>
            <Form.Item name="isOpenFence" label="开启电子围栏">
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={2}>关闭</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        ) : null}
        <Form.Item
          name="radius"
          label="围栏半径"
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || regNumber1.test(getFieldValue("radius"))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("只能输入非负数字"));
              }
            })
          ]}
          initialValue={1000}
        >
          <Input addonAfter="米" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
const mapStoreToProps = ({ commonStore }: IStoreProps) => ({
  commonStore
});
const mapDispatchToProps = (
  dispatch: (arg0: {
    type: string;
    payload: IDeliveriesParams | IReceivingParams | IOrganizationsParams;
  }) => any
) => ({
  getDeliveriesList: (params: IDeliveriesParams) =>
    dispatch({ type: "tenderManageStore/getDeliveriesList", payload: params }),
  getReceivingList: (params: IReceivingParams) =>
    dispatch({ type: "tenderManageStore/getReceivingList", payload: params }),
  getSupplierList: (params: IOrganizationsParams) =>
    dispatch({
      type: "commonStore/getSupplierList",
      payload: params
    })
});
export default connect(mapStoreToProps, mapDispatchToProps)(AddGoodsModal);
