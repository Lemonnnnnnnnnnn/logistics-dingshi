import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Form, message, Select } from "antd";
import MyDidPackageItem from "../components/my-did-package-item";
import TableX from "../../../components/tableX";
import PayModal from "@/components/pay-modal";
import { connect } from "dva";
import styles from "./index.scss";
import {
  IBidderOfferItem,
  IPatchTenderBidderParams,
  IStoreProps,
  IUserParams,
  IHomeStoreProps,
  UpdateType
} from "@/declares";
import { History } from "history";
import UploadX from "@/components/uploadX";
import { patchTenderBidder } from "@/services/bidding-manage-server";
import CommonHeader from "@/page/tender-manage/components/common-header";
import { browserTenderDetail } from "@/services/tender-manage-server";

interface ILocation extends Location {
  state: {
    tenderTitle: string;
    tenderId: number;
    tenderNo: string;
  };
}

interface IProps extends IStoreProps {
  location: ILocation;
  history: History;
  setNoticeTitle: (homeStore: IHomeStoreProps, title: string) => void;
  getTenderBidderDetail: (tenderId: number) => any;
  getContactIdItems: (params: IUserParams) => any;
}

const { Option } = Select;

const MyBid: React.FC<IProps> = ({
  history,
  location: {
    state: { tenderId, tenderTitle, tenderNo }
  },
  homeStore,
  commonStore: { currentUserInfo },
  biddingManageStore: { tenderBidderDetail },
  biddingManageStore: { contactIdItems: _contactIdItems },
  getContactIdItems,
  setNoticeTitle,
  getTenderBidderDetail
}): JSX.Element => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState([] as number[]);
  const [bidParams, setBidParams] = useState({});
  const isUpdate = location.pathname.indexOf("updateBiddingInfo") > -1;

  useEffect(() => {
    browserTenderDetail(tenderId).then(() => {
      getTenderBidderDetail(tenderId).then(() => {
        getContactIdItems({
          organizationId: currentUserInfo ? currentUserInfo?.organizationId : 0,
          limit: 1000,
          offset: 0,
          accountType: 3
        }).then(() => {
          setReady(true);
        });
      });
    });
  }, []);

  useEffect(() => {
    if (tenderBidderDetail) {
      setNoticeTitle(homeStore, tenderBidderDetail.tenderTitle);
      form.setFieldsValue({
        tenderBidderDentryid: tenderBidderDetail.tenderBidderDentryid?.split(
          ","
        ),
        contactIdItems: tenderBidderDetail.bidderContactItems
          ? tenderBidderDetail.bidderContactItems.map(item => item.contactId)
          : []
      });
      const selectedPackage: number[] = [];
      tenderBidderDetail.tenderPackageItems?.forEach(item => {
        const tenderPackageId: number = item.tenderPackageId;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < item.packageCorrelationResps.length; i++) {
          if (item.packageCorrelationResps[i].bidderOfferItems) {
            selectedPackage.push(tenderPackageId);
            // setSelectedPackage([...selectedPackage, tenderPackageId]);
            break;
          }
        }
      });
      setSelectedPackage(selectedPackage);
    }
  }, [tenderBidderDetail]);

  const columns = [
    {
      title: "??????",
      dataIndex: "id"
    },
    {
      title: "?????????",
      dataIndex: "feeName"
    },
    {
      title: "???????????????",
      dataIndex: "number",
      render: (text: number) => `???${text}`
    },
    {
      title: "??????",
      dataIndex: "remark",
      width: 500
    }
  ];

  const getParams = useCallback(
    (values: { tenderBidderDentryid: string[]; contactIdItems: number[] }) => {
      const { tenderBidderDentryid, contactIdItems, ...args } = values;

      const bidderOfferItems: IBidderOfferItem[] = Object.entries(args).reduce(
        (total: IBidderOfferItem[], [keyTenderPackageId, data]) => {
          const tenderPackageId = keyTenderPackageId.substr(3);

          if (!selectedPackage.find(item => item === Number(tenderPackageId))) {
            return total;
          }

          const packageCorrelationIdMap = new Map();

          Object.entries(data)?.forEach(([keyPackageCorrelationId, val]) => {
            const [
              keyName,
              packageCorrelationId
            ] = keyPackageCorrelationId?.split("&");
            const obj = packageCorrelationIdMap.get(packageCorrelationId) || {};

            obj[keyName] = val;
            packageCorrelationIdMap.set(packageCorrelationId, obj);
          });

          packageCorrelationIdMap?.forEach((val, key) => {
            total.push({
              tenderPackageId: Number(tenderPackageId),
              packageCorrelationId: Number(key),
              ...val
            });
          });

          return total;
        },
        []
      );

      if (!bidderOfferItems.length) {
        message.error("???????????????????????????");
        return false;
      }
      // return {
      //
      // };
      const params = {
        bidderOfferItems,
        tenderBidderId: tenderBidderDetail?.tenderBidderId,
        tenderBidderDentryid: tenderBidderDentryid?.join(","),
        contactIdItems,
        tenderId
      };
      setBidParams(params);
      return params;
    },
    [selectedPackage]
  );

  const onSubmit = useCallback(() => {
    form.validateFields().then(values => {
      const params = getParams(values);
      if (!params) {
        return false;
      }
      patchTenderBidder(params as IPatchTenderBidderParams).then(() => {
        if (!isUpdate) {
          setVisible(true);
          message.success("????????????");
        } else {
          message.success("????????????????????????");
          history.goBack();
        }
      });
    });
  }, [selectedPackage]);

  const selectPackage = useCallback(
    (val: any) => {
      setSelectedPackage(val);
    },
    [selectedPackage]
  );

  const sumFeeDataSource = useMemo(() => {
    const packageArr =
      tenderBidderDetail?.tenderPackageItems.filter(item =>
        selectedPackage.find(val => val === item.tenderPackageId)
      ) || [];
    const tenderFee = packageArr.reduce((total, current) => {
      total += current.tenderFee;
      return total;
    }, 0);

    const earnestMoney = packageArr.reduce((total, current) => {
      total += current.earnestMoney;
      return total;
    }, 0);

    return [
      {
        id: 1,
        feeName: "?????????",
        number: tenderFee,
        remark:
          "???????????????????????????????????????????????????????????????????????????????????????????????????3?????????????????????????????????????????????????????????????????????????????????"
      },
      {
        id: 2,
        feeName: "???????????????",
        number: earnestMoney,
        remark:
          "?????????????????????????????????????????????????????????????????????????????????????????????????????????3???????????????????????????????????????????????????????????????????????????????????????????????????"
      },
      {
        id: 3,
        feeName: "??????",
        number: tenderFee + earnestMoney,
        remark: ""
      }
    ];
  }, [selectedPackage]);

  return ready ? (
    <div className={`center-main ${styles.myDid} border-gray`}>
      <CommonHeader
        tenderTitle={tenderTitle}
        tenderNo={tenderNo}
        history={history}
        tenderId={tenderId}
      />

      <Form form={form} component={false}>
        <div className={`wrapBox ${styles.myDidContent}`}>
          <div className={styles.myDidContentTitle}>???????????????</div>

          <Checkbox.Group
            onChange={selectPackage}
            value={selectedPackage}
            style={{ width: "100%" }}
          >
            {tenderBidderDetail?.tenderPackageItems.map((item, key) => (
              <div
                key={item.tenderPackageId}
                className={styles.myDidPackageItemForm}
              >
                <div className={styles.myDidPackageItemTitle}>
                  <Checkbox value={item.tenderPackageId} className="mb-1">
                    <span className="ml-2">???{key + 1}???</span>
                    <span className="ml-2">{item.tenderPackageTitle}</span>
                    <span className="ml-2">
                      ???????????????{item.earnestMoney}???
                    </span>
                  </Checkbox>
                </div>
                <MyDidPackageItem
                  {...item}
                  selectedPackage={selectedPackage}
                  selectPackage={selectPackage}
                />
              </div>
            ))}
          </Checkbox.Group>
        </div>
        <div className={`wrapBox ${styles.didInfo}`}>
          <Form.Item
            name="tenderBidderDentryid"
            label="??????/??????"
            className={styles.uploadItem}
          >
            <UploadX
              onUpload={(res: string, del: boolean = false) => {
                const old = form.getFieldValue("tenderBidderDentryid") || [];
                if (del) {
                  form.setFieldsValue({
                    tenderBidderDentryid: [
                      old.filter((item: string) => item !== res)
                    ]
                  });
                } else {
                  form.setFieldsValue({ tenderBidderDentryid: [...old, res] });
                }
              }}
              showList={form.getFieldValue("tenderBidderDentryid")}
              title="????????????"
              maxLength={5}
              extra="?????????doc .docx .pdf .jpg.gif????????????????????????50M???????????????5??????"
              renderMode={UpdateType.Btn}
              // className="upload-list-inline"
            >
              <Button>????????????</Button>
            </UploadX>
          </Form.Item>
          <Form.Item
            name={`contactIdItems`}
            label="???????????????"
            rules={[{ required: true, message: "???????????????????????????" }]}
          >
            <Select mode="tags">
              {_contactIdItems.items.map(item => (
                <Option value={item.userId} key={item.userId}>
                  {item.nickName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <div className={`wrapBox ${styles.myDidContent}`}>
          <div className={styles.myDidContentTitle}>???????????????????????????</div>
          <TableX
            loading={false}
            rowKey="id"
            columns={columns}
            dataSource={sumFeeDataSource}
          />
        </div>
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          {isUpdate ? (
            <>
              <Button type="primary" onClick={onSubmit}>
                ??????
              </Button>
              <Button
                style={{ marginLeft: "20px" }}
                onClick={() => history.goBack()}
              >
                ??????
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={onSubmit}>
              ?????????????????????
            </Button>
          )}
        </div>
      </Form>
      {visible ? (
        <PayModal
          sumFeeDataSource={sumFeeDataSource}
          visible={visible}
          columns={columns}
          tenderId={tenderId}
          // setVisible={setVisible}
          onCancel={() => history.goBack()}
        />
      ) : null}
    </div>
  ) : (
    <></>
  );
};

const mapDispatchToProps = (
  dispatch: (arg0: { type: string; payload: any }) => any
) => ({
  getTenderBidderDetail: (tenderId: number) =>
    dispatch({
      type: "biddingManageStore/getTenderBidderDetail",
      payload: { tenderId }
    }),
  setNoticeTitle: (store: IStoreProps, payload: string) =>
    dispatch({ type: "homeStore/setNoticeTitle", store, payload }),
  getContactIdItems: (params: IUserParams) =>
    dispatch({
      type: "biddingManageStore/getContactIdItems",
      payload: { params }
    })
});

const mapStoreToProps = ({
  biddingManageStore,
  loading,
  homeStore,
  commonStore
}: IStoreProps) => ({
  biddingManageStore,
  commonStore,
  homeStore,
  loading
});

export default connect(mapStoreToProps, mapDispatchToProps)(MyBid);
