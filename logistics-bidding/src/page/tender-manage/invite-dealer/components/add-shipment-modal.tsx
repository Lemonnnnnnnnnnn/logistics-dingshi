import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Input, List, Row, Col, Card } from "antd";
import { postConsignmentRelationships } from "@/services/tender-manage-server";
import {
  IOrganizationsReqs,
  IOrganizationsParams,
  ITenderInvitedItem
} from "@/declares/tender-manage";
import { connect } from "dva";
import { IStoreProps } from "@/declares";

interface IProps extends IStoreProps {
  inviteListDetailResps: ITenderInvitedItem[];
  getAddShipmentList: (params: IOrganizationsParams) => void;
  getInvitedList: (payload: { tenderId: number }) => any;
  refreshShipmentList: () => any;
}

const getAddShipmentListType = "commonStore/getAddShipmentList";

const AddShipmentModal: React.FC<IProps> = ({
  commonStore: { addShipmentList },
  getAddShipmentList,
  loading,
  refreshShipmentList
}) => {
  const [inputVal, setInputVal] = useState("");

  const isLoading = loading.effects[getAddShipmentListType];

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const refresh = () => {
    getAddShipmentList({
      limit: 1000,
      offset: 0,
      selectType: 3,
      organizationType: 5,
      isAvailable: 1,
      auditStatus: 1,
      vagueSelect: inputVal
    });
  };

  useEffect(() => {
    refresh();
  }, [inputVal]);

  const onAddShipment = (shipmentId: number) => {
    postConsignmentRelationships({
      relationshipOrgType: 5,
      relationshipOrgId: shipmentId
    })
      .then(() => {
        refresh();
        refreshShipmentList();
      })
      .catch(() => {
        refresh();
        refreshShipmentList();
      });
  };

  const renderItem: (item: IOrganizationsReqs) => JSX.Element = useCallback(
    (item: IOrganizationsReqs) => {
      return (
        <List.Item>
          <Card
            title={item.organizationName}
            extra={
              item.isUsed ? (
                <a style={{ color: "gray" }}>已添加</a>
              ) : (
                <a onClick={() => onAddShipment(item?.organizationId)}>添加</a>
              )
            }
          >
            <Row>
              <Col span={8}>{item.contactName}</Col>
              <Col span={12}>{item.contactPhone}</Col>
            </Row>
            <Row>
              <Col>{item.organizationAddress}</Col>
            </Row>
          </Card>
        </List.Item>
      );
    },
    [addShipmentList]
  );

  return (
    <div>
      <Input.Search
        placeholder="请输入承运方名称"
        enterButton="搜索"
        size="large"
        value={inputVal}
        onChange={onChange}
        // onSearch={onSearch}
        style={{ width: "80%", marginLeft: "10%" }}
      />
      <List
        loading={isLoading}
        grid={{ gutter: 25, column: 4 }}
        dataSource={addShipmentList.items}
        renderItem={renderItem}
        className="mt-2"
      />
    </div>
  );
};

const mapStoreToProps = ({ commonStore, loading }: IStoreProps) => ({
  commonStore,
  loading
});

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: IOrganizationsParams }) => any
) => ({
  getAddShipmentList: (params: IOrganizationsParams) =>
    dispatch({
      type: getAddShipmentListType,
      payload: params
    })
});

export default connect(mapStoreToProps, mapDispatchToProps)(AddShipmentModal);
