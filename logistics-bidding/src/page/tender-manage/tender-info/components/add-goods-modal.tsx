import {
  IGoodsCategoriesParams,
  IGoodsParams,
  IStoreProps,
  ITenderManageStoreProps
} from "../../../../declares";
import { postGoods } from "../../../../services/tender-manage-server";
import { Form, Input, Modal, Select, Cascader, message } from "antd";
import { connect } from "dva";
import React, { useCallback, useEffect } from "react";

interface IProps {
  visible: boolean;
  tenderManageStore: ITenderManageStoreProps;
  getGoodsList: (params: IGoodsParams) => void;
  getGoodsCategoriesList: (params?: IGoodsCategoriesParams) => void;
  setVisible: (bool: boolean) => void;
}
const AddGoodsModal: React.FunctionComponent<IProps> = ({
  visible,
  getGoodsList,
  tenderManageStore,
  getGoodsCategoriesList,
  setVisible
}): JSX.Element => {
  const [form] = Form.useForm();
  useEffect(() => {
    getGoodsCategoriesList();
  }, []);
  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      values.categoryId = values.categoryId[values.categoryId.length - 1];
      postGoods({ ...values }).then(() => {
        message.success("添加货品成功");
        setVisible(false);
        getGoodsList({ limit: 1000, offset: 0 });
      });
    });
  }, [visible]);
  return (
    <Modal
      title="添加货品"
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
          name="categoryId"
          label="货品类目"
          rules={[{ required: true }]}
        >
          <Cascader
            options={tenderManageStore.goodsCategoriesList as any}
            placeholder="Please select"
          />
        </Form.Item>
        <Form.Item
          name="goodsName"
          label="货品品牌"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="specificationType" label="规格型号（选填）">
          <Input />
        </Form.Item>
        <Form.Item name="materialQuality" label="材质（选填）">
          <Input />
        </Form.Item>
        <Form.Item name="packagingMethod" label="包装方式（选填）">
          <Select>
            <Select.Option value={2}>散装</Select.Option>
            <Select.Option value={1}>袋装</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
const mapStoreToProps = ({ tenderManageStore }: IStoreProps) => ({
  tenderManageStore
});
const mapDispatchToProps = (
  dispatch: (arg0: {
    type: string;
    payload: IGoodsCategoriesParams | IGoodsParams;
  }) => any
) => ({
  getGoodsCategoriesList: (params: IGoodsCategoriesParams) =>
    dispatch({
      type: "tenderManageStore/getGoodsCategoriesList",
      payload: params
    }),
  getGoodsList: (params: IGoodsParams) =>
    dispatch({ type: "tenderManageStore/getGoodsList", payload: params })
});
export default connect(mapStoreToProps, mapDispatchToProps)(AddGoodsModal);
