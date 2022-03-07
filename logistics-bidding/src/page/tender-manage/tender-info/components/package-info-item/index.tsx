import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Col, Row, Select, FormInstance } from "antd";
import EditTable from "../../../../../components/tableX/edit-table";
import AddGoodsModal from "../add-goods-modal";
import AddTakeGoodsModal from "../add-take-goods";
import styles from "./index.scss";
import { connect } from "dva";
import {
  IStoreProps,
  ITenderManageStoreProps,
  IGoodsParams,
  IDeliveriesParams,
  IReceivingParams,
  GOODS_UNITS_DICT
} from "../../../../../declares";
import { regNumber1, renderOptions } from "@/utils/utils";

const { TextArea } = Input;

interface IProps {
  num: number;
  showDelete: boolean;
  form: FormInstance;
  disable: boolean;
  dataItem: any;
  setIsEdit?: (bool: boolean) => void;
  tenderManageStore: ITenderManageStoreProps;
  getDeliveriesList: (params: IDeliveriesParams) => void;
  getGoodsList: (params: IGoodsParams) => void;
  getReceivingList: (params: IReceivingParams) => void;
  onDelete: (index: number | number[]) => void;
}

const PackageInfoItem: React.FunctionComponent<IProps> = ({
  num,
  showDelete,
  dataItem,
  disable,
  form,
  tenderManageStore: { goodsList, receivingList, deliveriesList },
  getGoodsList,
  setIsEdit,
  getDeliveriesList,
  getReceivingList,
  onDelete
}): JSX.Element => {
  const packageCreateReqs = form.getFieldsValue().packageCreateReqs;
  const [data, setData] = useState(
    packageCreateReqs[dataItem.key] &&
      packageCreateReqs[dataItem.key].packageCorrelationCreateReqs
      ? packageCreateReqs[dataItem.key].packageCorrelationCreateReqs
      : []
  );
  const [goodsVisible, setGoodsVisible] = useState(false); // 添加货品
  const [takeGoodsVisible, setTakeGoodsVisible] = useState(false); // 添加提货点
  const [goodsTypeVisible, setGoodsTypeVisible] = useState(0); // 添加提货点

  const goodsUnits = renderOptions(GOODS_UNITS_DICT);

  useEffect(() => {
    getGoodsList({ limit: 1000, offset: 0 });
    getReceivingList({ limit: 1000, offset: 0, isAvailable: 1 });
    getDeliveriesList({ limit: 1000, offset: 0, isAvailable: 1 });
  }, []);
  const renderGoods = useMemo(() => {
    return (
      <Form.Item
        name="goodsId"
        rules={[{ required: true, message: "请选择货品" }]}
      >
        <Select
          placeholder="请选择"
          showSearch
          filterOption={(input, option) =>
            option!.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {goodsList.map(item => {
            const name = item.categoryName
              ? `${item.categoryName}-${item.goodsName}${
                  item.materialQuality ? `(${item.materialQuality})` : ""
                }${item.specificationType ? `(${item.specificationType})` : ""}`
              : item.goodsName;
            return (
              <Select.Option key={item.goodsId} value={item.goodsId || ""}>
                {name}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    );
  }, [goodsList]);
  const renderDeliveries = useMemo(() => {
    return (
      <Form.Item
        name="deliveryId"
        rules={[{ required: true, message: "请选择提货点" }]}
      >
        <Select
          placeholder="请选择"
          showSearch
          filterOption={(input, option) =>
            option!.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {deliveriesList.map(item => (
            <Select.Option key={item.deliveryId} value={item.deliveryId}>
              {item.deliveryName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }, [deliveriesList]);
  const renderReceiving = useMemo(() => {
    return (
      <Form.Item
        name="receivingId"
        rules={[{ required: true, message: "请选择卸货点" }]}
      >
        <Select
          placeholder="请选择"
          showSearch
          filterOption={(input, option) =>
            option!.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {receivingList.map(item => (
            <Select.Option key={item.receivingId} value={item.receivingId}>
              {item.receivingName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }, [receivingList]);
  const columns = [
    {
      title: "线路",
      key: "index",
      width: 70,
      fixed: true,
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>
    },
    {
      title: (
        <div className={styles.packageInfoThTitle}>
          <span style={{ color: "red", marginRight: 5 }}>*</span>
          <span>货品</span>
          {disable ? null : (
            <span
              onClick={() => setGoodsVisible(true)}
              className={styles.packageInfoThBtn}
            >
              添加货品
            </span>
          )}
        </div>
      ),
      dataIndex: "goodsId",
      width: 300,
      editable: true, // 当前行是否可编辑
      editRender: () => {
        return renderGoods;
      },
      render: (text: string, row: any) => {
        const current = goodsList.find(item => item.goodsId === text);
        const name = current
          ? current.categoryName
            ? `${current.categoryName}-${current.goodsName}${
                current.materialQuality ? `(${current.materialQuality})` : ""
              }${
                current.specificationType
                  ? `(${current.specificationType})`
                  : ""
              }`
            : current.goodsName
          : `${row.categoryName}-${row.goodsName}`;
        return name;
      }
    },
    {
      title: (
        <div className={styles.packageInfoThTitle}>
          <span style={{ color: "red", marginRight: 5 }}>*</span>
          <span>提货点</span>
          {disable ? null : (
            <span
              className={styles.packageInfoThBtn}
              onClick={() => {
                setTakeGoodsVisible(true);
                setGoodsTypeVisible(0);
              }}
            >
              添加提货点
            </span>
          )}
        </div>
      ),
      width: 300,
      dataIndex: "deliveryId",
      editable: true, // 当前行是否可编辑
      editRender: () => renderDeliveries,
      render: (text: string, row: any) => {
        const current = deliveriesList.find(
          item => item.deliveryId === Number(text)
        );
        return current ? current.deliveryName : row.deliveryName;
      }
    },
    {
      title: (
        <div className={styles.packageInfoThTitle}>
          <span style={{ color: "red", marginRight: 5 }}>*</span>
          <span>卸货点</span>
          {disable ? null : (
            <span
              className={styles.packageInfoThBtn}
              onClick={() => {
                setTakeGoodsVisible(true);
                setGoodsTypeVisible(1);
              }}
            >
              添加卸货点
            </span>
          )}
        </div>
      ),
      width: 300,
      dataIndex: "receivingId",
      editable: true, // 当前行是否可编辑
      editRender: () => renderReceiving,
      render: (text: string, row: any) => {
        const current = receivingList.find(
          item => item.receivingId === Number(text)
        );
        return current ? current.receivingName : row.receivingName;
      }
    },
    {
      title: (
        <div>
          <span style={{ color: "red", marginRight: 5 }}>*</span>
          <span>计量单位</span>
        </div>
      ),
      dataIndex: "goodsUnit",
      width: 120,
      editable: true, // 当前行是否可编辑
      editRender: () => (
        <Form.Item
          name="goodsUnit"
          rules={[{ required: true, message: "请选择计量单位" }]}
        >
          <Select>
            {goodsUnits.map(item => (
              <Select.Option value={item.value} key={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ),
      render: (text: string) => {
        const current = goodsUnits.find(
          item => Number(item.value) === Number(text)
        );
        return current ? current.label : "-";
      }
    },
    {
      title: "最高限价（含税运费）",
      dataIndex: "maxContain",
      width: 200,
      editable: true, // 当前行是否可编辑
      editRender: () => (
        <Form.Item
          name="maxContain"
          rules={[
            { message: "请输入最高限价（含税运费）" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || regNumber1.test(getFieldValue("maxContain"))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("只能输入非负数字"));
              }
            })
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: "最高限价（不含税运费）",
      dataIndex: "maxNotContain",
      width: 200,
      editable: true, // 当前行是否可编辑
      editRender: () => (
        <Form.Item
          name="maxNotContain"
          rules={[
            { message: "请输入最高限价（不含税运费）" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || regNumber1.test(getFieldValue("maxNotContain"))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("只能输入非负数字"));
              }
            })
          ]}
        >
          <Input />
        </Form.Item>
      )
    },
    {
      title: (
        <div>
          <span style={{ color: "red", marginRight: 5 }}>*</span>
          <span>预计运输量</span>
        </div>
      ),
      dataIndex: "estimateTransportVolume",
      width: 120,
      editable: true, // 当前行是否可编辑
      editRender: () => (
        <Form.Item
          name="estimateTransportVolume"
          rules={[
            { required: true, message: "请输入预计运输量" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  regNumber1.test(getFieldValue("estimateTransportVolume"))
                ) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("只能输入非负数字"));
              }
            })
          ]}
        >
          <Input />
        </Form.Item>
      )
    }
  ];
  useEffect(() => {
    if (packageCreateReqs[dataItem.key]) {
      packageCreateReqs[dataItem.key].packageCorrelationCreateReqs = data;
      form.setFieldsValue({ packageCreateReqs });
    }
  }, [data]);
  return (
    <div className={styles.packageInfoItem}>
      <Row style={{ marginBottom: 20 }}>
        <Col span={2}>
          <div className={styles.packageInfoItemTitle}>第{num}包</div>
        </Col>
        {showDelete && !disable ? null : (
          <Col span={3}>
            <div
              className={styles.packageInfoItemDele}
              onClick={() => onDelete(dataItem.name)}
            >
              删除包件
            </div>
          </Col>
        )}
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item
            name={[dataItem.name, "tenderPackageTitle"]}
            label="包件标题"
          >
            <Input disabled={disable} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={[dataItem.name, "earnestMoney"]}
            label=" 该包投标保证金(元）"
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    regNumber1.test(
                      getFieldValue("packageCreateReqs")[dataItem.name]
                        .earnestMoney
                    )
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("只能输入非负数字"));
                }
              })
            ]}
          >
            <Input disabled={disable} />
          </Form.Item>
        </Col>
      </Row>
      <Row style={{ marginTop: "20px" }}>
        <Col span={18}>
          <Form.Item
            name={[dataItem.name, "tenderFee"]}
            label="标书费 （元）"
            rules={[
              { required: true, message: "请输入标书费" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    !value ||
                    /^\d*$/.test(
                      getFieldValue("packageCreateReqs")[dataItem.name]
                        .tenderFee
                    )
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("只能输入正整字"));
                }
              })
            ]}
          >
            <Input placeholder="整数，若不收取，请填写0" disabled={disable} />
          </Form.Item>
          <span style={{ color: "#666", fontSize: "12px" }}>
            （平台代收，投标结束后自动划转至招标公司账户）
          </span>
        </Col>
      </Row>
      <div className={styles.packageInfoItemSmallTitle}>运输线路：</div>
      <div className={styles.packageInfoItemTable}>
        <Form.Item name={[dataItem.name, "packageCorrelationCreateReqs"]}>
          <EditTable
            setIsEdit={setIsEdit}
            hasAdd={!disable}
            loading={false}
            rowKey="packageCorrelationId"
            scroll={{ x: "150%", y: 500 }}
            columns={columns}
            dataSource={data ? data : []}
            setDatas={list => {
              setData(list as any);
            }}
          />
        </Form.Item>
      </div>
      <div
        className={styles.packageInfoItemSmallTitle}
        style={{ margin: "20px 0" }}
      >
        其它要求/说明：
      </div>
      <Form.Item name={[dataItem.name, "remark"]}>
        <TextArea
          disabled={disable}
          rows={5}
          style={{ width: "100%" }}
          placeholder="可输入车俩车型要求，高峰期运输车辆要求及一些特殊的限定条件"
        />
      </Form.Item>

      {/* 添加货品 */}
      {goodsVisible ? (
        <AddGoodsModal visible={goodsVisible} setVisible={setGoodsVisible} />
      ) : null}

      {/* 添加提货点 */}
      {takeGoodsVisible ? (
        <AddTakeGoodsModal
          visible={takeGoodsVisible}
          goodsTypeVisible={goodsTypeVisible}
          setVisible={setTakeGoodsVisible}
        />
      ) : null}
    </div>
  );
};

const mapStoreToProps = ({ tenderManageStore }: IStoreProps) => ({
  tenderManageStore
});
const mapDispatchToProps = (
  dispatch: (arg0: {
    type: string;
    payload: IGoodsParams | IDeliveriesParams | IReceivingParams;
  }) => any
) => ({
  getGoodsList: (params: IGoodsParams) =>
    dispatch({ type: "tenderManageStore/getGoodsList", payload: params }),
  getDeliveriesList: (params: IDeliveriesParams) =>
    dispatch({ type: "tenderManageStore/getDeliveriesList", payload: params }),
  getReceivingList: (params: IReceivingParams) =>
    dispatch({ type: "tenderManageStore/getReceivingList", payload: params })
});
export default connect(mapStoreToProps, mapDispatchToProps)(PackageInfoItem);
