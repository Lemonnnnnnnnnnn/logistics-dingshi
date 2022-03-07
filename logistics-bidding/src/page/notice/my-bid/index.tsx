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
      title: "序号",
      dataIndex: "id"
    },
    {
      title: "费用项",
      dataIndex: "feeName"
    },
    {
      title: "金额（元）",
      dataIndex: "number",
      render: (text: number) => `￥${text}`
    },
    {
      title: "说明",
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
        message.error("请至少选择一件包件");
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
          message.success("投标成功");
        } else {
          message.success("修改投标信息成功");
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
        feeName: "标书费",
        number: tenderFee,
        remark:
          "该费用为本次投标标书制作费，由招标公司收取，若中途该标书撤回，将在3个工作内退回易键达账户，其它情况无论中标与否都不予退还"
      },
      {
        id: 2,
        feeName: "投标保证金",
        number: earnestMoney,
        remark:
          "该费用为投标履行保证金，由平台收取，在开标后或标书撤回后，若未中标将在3个工作内退回易键达账户，若中标，则需要提交申请，招标方同意方能退回"
      },
      {
        id: 3,
        feeName: "小计",
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
          <div className={styles.myDidContentTitle}>项目报价：</div>

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
                    <span className="ml-2">第{key + 1}包</span>
                    <span className="ml-2">{item.tenderPackageTitle}</span>
                    <span className="ml-2">
                      投标保证金{item.earnestMoney}元
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
            label="投标/资质"
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
              title="上传文件"
              maxLength={5}
              extra="支持：doc .docx .pdf .jpg.gif等，单个文件最大50M，最多上传5个。"
              renderMode={UpdateType.Btn}
              // className="upload-list-inline"
            >
              <Button>上传文件</Button>
            </UploadX>
          </Form.Item>
          <Form.Item
            name={`contactIdItems`}
            label="业务联系人"
            rules={[{ required: true, message: "请输入业务联系人！" }]}
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
          <div className={styles.myDidContentTitle}>投标费用及保证金：</div>
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
                保存
              </Button>
              <Button
                style={{ marginLeft: "20px" }}
                onClick={() => history.goBack()}
              >
                取消
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={onSubmit}>
              提交表单并支付
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
