import React, { Component } from "react";
import { Row, Col, Button, Input, notification, message, Modal, Icon } from "antd";
import { SchemaForm, Item, Observer } from "@gem-mine/antd-schema-form";
import CSSModules from "react-css-modules";
import moment from "moment";
import DebounceFormButton from "../../../components/debounce-form-button";
import "@gem-mine/antd-schema-form/lib/fields";
import TableContainer from "../../../components/table/table-container";
import {
  getAuthorizationPhone,
  getAuthNotCode,
  changePaymentAuthorizationPhone,
  getAccountsInformation,
  postInternalTransfer,
  postWithdraw
} from "../../../services/apiService";
import { isNumber, formatMoney, formatTop } from "../../../utils/utils";
import GetSmsCode from "../../registered/get-sms-code";
import Authorized from "../../../utils/Authorized";
import auth from "../../../constants/authCodes";
import styles from "./customer.less";
import PlatRechargeForm from "./component/plat-recharge-form";
import SelectBox from "./component/select-box";
import WithdrawalInput from "./component/withdrawal-input";
import ReplaceRecharge from "./component/replace-recharge";
import BranchBanksSelector from "./component/branch-banks-selector";
import TransferOutModal from "./component/transfer-out-modal";

const formLayOut = {
  labelCol: {
    xs: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 }
  }
};

const {
  FUNDS_INSIDETRANSFER_INTO_PROVISION,
  FUNDS_INSIDETRANSFER_CHANGE_PHONE,
  FUNDS_INSIDETRANSFER_RECHARGE,
  FUNDS_INSIDETRANSFER_WITHDRAWAL,
  FUNDS_TRANSFER_TO_BASIC_TAXPAYER
} = auth;

@TableContainer()
@CSSModules(styles, { allowMultiple: true })
class FundAccount extends Component {

  state = {
    ready: false,
    transferModal: false,
    accountData: {},
    editAble: false,
    rechargeFormStatus: false,
    number: 60,
    withdrawalModal: false,
    submitData: {},
    nextForm: false,
    replaceRechargeFormStatus: false,
    showTransferOutModal: false,
    index: 1
  };

  searchSchema = {
    transferState: {
      label: "????????????",
      component: "select",
      options: [
        {
          label: "?????????",
          value: 0,
          key: 0
        },
        {
          label: "?????????",
          value: 1,
          key: 1
        },
        {
          label: "?????????",
          value: 2,
          key: 2
        }
      ],
      placeholder: "?????????????????????"
    },
    transactionType: {
      label: "????????????",
      placeholder: "?????????????????????",
      component: "select",
      options: [{
        label: "????????????",
        value: 1,
        key: 1
      }, {
        label: "???????????????",
        value: 2,
        key: 2
      }, {
        label: "??????????????????",
        value: 3,
        key: 3
      }, {
        label: "????????????",
        value: 4,
        key: 4
      }, {
        label: "???????????????",
        value: 5,
        key: 5
      }, {
        label: "???????????????",
        value: 6,
        key: 6
      }, {
        label: "??????",
        value: 7,
        key: 7
      }, {
        label: "????????????????????????",
        value: 8,
        key: 8
      }, {
        label: "????????????",
        value: 9,
        key: 9
      }, {
        label: "????????????",
        value: 10,
        key: 10
      }, {
        label: "?????????????????????",
        value: 11,
        key: 11
      }, {
        label: "???????????????",
        value: 12,
        key: 12
      }, {
        label: "???????????????",
        value: 13,
        key: 13
      }, {
        label: "????????????",
        value: 14,
        key: 14
      }, {
        label: "???????????????",
        value: 15,
        key: 15
      }, {
        label: "????????????",
        value: 16,
        key: 16
      }]
    },
    rollTime: {
      label: "??????/????????????",
      component: "rangePicker"
    }
  };

  constructor(props) {
    super(props);
    this.tableSchema = {
      variable: true,
      minWidth: 2000,
      columns: [
        {
          title: "????????????",
          dataIndex: "transferState",
          fixed: "left",
          width: 140,
          render: (text) => ({
            0: "?????????",
            1: "?????????",
            2: "?????????"
          }[text])
        }, {
          title: "????????????",
          dataIndex: "transactionType",
          render: (text) => ({}[text] || "????????????")
        }, {
          title: "????????????",
          dataIndex: "transactionNo"
        }, {
          title: "?????????",
          dataIndex: "payerName",
          width: 250
        }, {
          title: "????????????",
          dataIndex: "payerAccount"
        }, {
          title: "?????????",
          dataIndex: "payeeName"
          // render: text => ({
          //   1:'????????????',
          //   2:'???????????????'
          // }[text])
        }, {
          title: "????????????",
          dataIndex: "payeeAccount"
        }, {
          title: "??????/????????????",
          dataIndex: "rollTime",
          render: text => moment(text).format("YYYY/MM/DD HH:mm")
        }, {
          title: "???????????????",
          dataIndex: "remittanceIdentificationCode"
        }, {
          title: "???????????????",
          dataIndex: "transactionAmount"
        }, {
          title: "??????",
          dataIndex: "remarks"
        }
      ]
    };
    this.transferForm = {
      payerAccountType: {
        component: SelectBox,
        options: [
          {
            key: 2,
            value: 2,
            label: "??????????????????"
          },
          {
            key: 3,
            value: 3,
            label: "??????????????????"
          }
        ],
        rules: {
          required: [true, "??????????????????"]
        }
      },
      payeeAccountType: {
        component: SelectBox,
        observer: Observer({
          watch: "payerAccountType",
          action: (payerAccountType, { value }) => {
            const options = [
              {
                key: 1,
                value: 1,
                label: "??????????????????"
              },
              {
                key: 3,
                value: 3,
                label: "??????????????????"
              }
            ];
            return {
              options: options.map(item => ({ ...item, disabled: `${item.value}` === `${payerAccountType}` })),
              value: `${value}` === `${payerAccountType}` ? undefined : value
            };
          }
        }),
        rules: {
          required: [true, "?????????????????????"]
        }
      },
      transferAmount: {
        label: "????????????",
        component: "input",
        allowClear: true,
        observer: Observer({
          watch: "payerAccountType",
          action: (payerAccountType) => {
            const { accountData: { logisticsBankAccountEntities = [] } } = this.state;
            const keyword = {
              1: "????????????",
              2: "????????????",
              3: "????????????"
            }[payerAccountType] || "????????????";
            const accountData = logisticsBankAccountEntities.find(item => item.bankName.indexOf(keyword) > -1) || {};
            return {
              placeholder: isNumber(accountData.bankAccountBalance) ? `????????????${accountData.bankAccountBalance}???` : "?????????????????????"
            };
          }
        }),
        addonAfter: "???",
        rules: {
          required: [true, "?????????????????????"],
          validator: ({ value }) => {
            if (!/^\d+\.?\d{0,2}$/.test(value)) return "???????????????????????????!   (????????????????????????)";
            if (value <= 0) return "???????????????????????????!   (????????????????????????)";
          }
        }
      },
      remarks: {
        component: "input.textArea",
        placeholder: "?????????????????????"
      }
    };
    this.passFormSchema = {
      phone: {
        component: "input.text",
        placeholder: "??????????????????",
        rules: {
          required: [true, "??????????????????"]
        }
      },
      smsCode: {
        component: GetSmsCode,
        needCheckCode: false,
        smsType: "WITHDRAWAL",
        rules: {
          required: [true, "????????????????????????"]
        },
        placeholder: "????????????????????????"
      }
    };
  }

  componentDidMount() {
    // const { getInternalTransfers } = this.props
    Promise.all([getAuthorizationPhone(), getAccountsInformation()])
      .then(([phoneData, accountData]) => {
        const keyword = "????????????";
        const backAccount = accountData.logisticsBankAccountEntities.find(item => item.bankName.indexOf(keyword) > -1) || {};
        this.withdrawalForm = {
          transferAmount: {
            label: "????????????",
            component: WithdrawalInput,
            maxMoney: backAccount.bankAccountBalance,
            rules: {
              required: [true, "?????????????????????"],
              validator: ({ value }) => {
                if (!/^\d+\.?\d{0,2}$/.test(value)) return "???????????????????????????!   (????????????????????????)";
                if (value <= 0) return "???????????????????????????!   (????????????????????????)";
                if (value > backAccount.bankAccountBalance && !accountData.shield) return "?????????????????????";
              }
            }
          },
          payeeAccount: {
            label: "????????????",
            component: "input",
            placeholder: "????????????????????????",
            rules: {
              required: [true, "?????????????????????"],
              validator: ({ value }) => {
                const reg = /^[0-9]*$/;
                if (!reg.test(value)) {
                  return "???????????????????????????";
                }
              }
            }
          },
          branchBanks: {
            label: "????????????",
            component: BranchBanksSelector
          },
          bankCode: {
            label: "????????????",
            component: "input",
            placeholder: "???????????????????????????",
            rules: {
              required: [true, "???????????????????????????"],
              validator: ({ value }) => {
                const reg = /^[0-9]*$/;
                if (!reg.test(value)) {
                  return "???????????????????????????";
                }
                if (value.length !== 12) {
                  return "???????????????12???????????????";
                }
              }
            },
            value: Observer({
              watch: "branchBanks",
              action: (branchBanks = {}) => branchBanks.key
            })
          }
        };
        this.setState({
          ready: true,
          accountData,
          phone: phoneData.paymentAuthorizationPhone
        });
      });
  }

  // searchTableList = () => {
  //   const formLayOut = {
  //     labelCol:{
  //       xs: { span: 8 }
  //     },
  //     wrapperCol: {
  //       xs: { span: 16 }
  //     }
  //   }
  //   return (
  //     <SearchForm layout="inline" {...formLayOut} schema={this.searchSchema} mode={FORM_MODE.SEARCH}>
  //       <Item field="transferState" />
  //       <Item field="transactionType" />
  //       <Item field="rollTime" />
  //       <DebounceFormButton label="??????" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
  //       <DebounceFormButton label="??????" className="mr-10" onClick={this.handleResetBtnClick} />
  //     </SearchForm>
  //   )
  // }

  // handleSearchBtnClick = value => {
  //   this.setState({
  //     nowPage:1
  //   })
  //   const rollTimeStart = value.rollTime && value.rollTime.length ? value.rollTime[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY/MM/DD HH:mm:ss') : undefined
  //   const rollTimeEnd = value.rollTime && value.rollTime.length ? value.rollTime[1].set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format('YYYY/MM/DD HH:mm:ss') : undefined
  //   const newFilter = this.props.setFilter({ rollTimeStart, rollTimeEnd, offset: 0 })
  //   this.props.getInternalTransfers(newFilter)
  // }

  // handleResetBtnClick = () => {
  //   const newFilter = this.props.resetFilter({})
  //   this.setState({
  //     nowPage:1,
  //     pageSize:10
  //   })
  //   this.props.getInternalTransfers(newFilter)
  // }


  // onChange = (pagination) => {
  //   const { offset, limit, current } = translatePageType(pagination)
  //   this.setState({
  //     nowPage:current,
  //     pageSize:limit
  //   })
  //   const newFilter=this.props.setFilter({ offset, limit })
  //   this.props.getInternalTransfers(newFilter)
  // }

  refresh = () =>{
    getAccountsInformation().then(accountData=>this.setState({ accountData }));
  }

  fundTransfer = () => {
    this.setState({
      transferModal: true
    });
  };

  closeTransferModal = () => {
    this.setState({
      transferModal: false
    });
  };

  editPhone = () => {
    this.setState({
      editAble: true
    });
  };

  getSMScode = () => {
    const { phone } = this.state;
    getAuthNotCode({ phone, template: "SMS_190282273" })
      .then(data => {
        if (data && data.Code && data.Code.toLocaleLowerCase() === "ok") {
          this.timeout = setInterval(() => {
            const { number } = this.state;
            this.setState({
              number: number - 1
            }, () => {
              if (this.state.number === 0) {
                clearInterval(this.timeout);
                this.setState({
                  number: 60
                });
              }
            });
          }, 1000);
        } else if (data && data.Code && data.Code === "isv.BUSINESS_LIMIT_CONTROL") {
          notification.error({
            message: "?????????????????????",
            description: data && data.Message || "???????????????????????????????????????"
          });
        }
      });
  };

  cancelEdit = () => {
    this.smsCode = undefined;
    this.newPhone = undefined;
    this.setState({
      editAble: false
    });
  };

  saveChange = () => {
    const { phone } = this.state;
    const reg = /^1\d{10}$/;
    const check = reg.test(this.newPhone);
    if (!check) return message.error("???????????????????????????");
    if (!this.smsCode) return message.error("?????????????????????????????????");
    changePaymentAuthorizationPhone({
      oldPaymentAuthorizationPhone: phone,
      newPaymentAuthorizationPhone: this.newPhone,
      smsCode: this.smsCode
    })
      .then(() => {
        notification.success({
          message: "????????????",
          description: "?????????????????????????????????"
        });
        this.setState({
          phone: this.newPhone
        });
        this.cancelEdit();
      })
      .catch((error) => {
        notification.error({
          message: "????????????",
          description: error.message
        });
      });
  };

  changeSmsCode = (e) => {
    const { value } = e.target;
    this.smsCode = value;
  };

  changeNewPhone = (e) => {
    const { value } = e.target;
    this.newPhone = value;
  };

  openRechargeModal = () => {
    this.setState({
      rechargeFormStatus: true
    });
  };

  openTransferOutModal = () => {
    this.setState({
      showTransferOutModal: true
    });
  };

  openReplaceRechargeModal = () => {
    this.setState({
      replaceRechargeFormStatus: true
    });
  };

  closeReplaceRechargeModal = () => {
    this.setState({
      replaceRechargeFormStatus: false
    });
  };

  closeRechargeModal = () => {
    this.setState({
      rechargeFormStatus: false
    });
  };

  openWithdrawalModal = () => {
    this.setState({
      withdrawalModal: true
    });
  };

  closeWithdrawalModal = () => {
    this.setState({
      withdrawalModal: false,
      nextForm: false,
      submitData: {}
    });
  };

  nextStep = (value) => {
    this.setState({
      submitData: { ...value, payeeAccountName: "??????????????????????????????" },
      nextForm: true
    });
  };

  lastStep = () => {
    this.setState({
      submitData: {},
      nextForm: false
    });
  };

  submitWithdrawal = (value) => {
    const { phone, smsCode } = value;
    const { accountData, submitData } = this.state;
    const keyword = "????????????";
    const backAccount = accountData.logisticsBankAccountEntities.find(item => item.bankName.indexOf(keyword) > -1) || {};
    postWithdraw({
      payerAccountType: 3,
      payerAccountName: backAccount.bankName,
      payerAccount: backAccount.bankAccount,
      authorizationPhone: phone,
      smsCode,
      ...submitData
    })
      .then(() => {
        this.closeWithdrawalModal();
        notification.success({
          message: "??????????????????"
        });
        return getAccountsInformation();
      })
      .then((accountData) => {
        this.setState({
          accountData
        });
      });
  };

  renderVirtualAccount = (type) => {
    const { accountData: { logisticsVirtualAccountEntities, shield } } = this.state;
    const accountData = logisticsVirtualAccountEntities.find(item => item.virtualAccountType === type) || {};
    const name = {
      1: "??????????????????",
      2: "??????????????????",
      3: "??????????????????",
      4: "??????????????????",
      5: "??????????????????",
      6: "??????????????????",
      7: "???????????????????????????",
      8: "???????????????????????????",
      9: "??????????????????",
      10: "???????????????????????????",
      11: "??????????????????"
    }[accountData.virtualAccountType] || "????????????";
    const _name = {
      1: "??????-????????????",
      2: "??????-????????????",
      3: "??????-????????????",
      4: "??????-????????????",
      5: "??????-????????????",
      6: "??????-????????????",
      7: "??????-?????????????????????",
      8: "??????-?????????????????????",
      9: "??????-????????????",
      10: "????????????????????????????????????",
      11: "??????-????????????"
    }[accountData.virtualAccountType] || "??????";
    const operation = {
      3: null,
      4: (
        <>
          <Authorized authority={[FUNDS_INSIDETRANSFER_RECHARGE]}>
            <Button
              onClick={this.openRechargeModal}
              style={{
                position: "absolute",
                right: "20px",
                borderColor: "#1890FF",
                color: "#1890FF"
              }}
            >????????????
            </Button>
          </Authorized>
          <Button
            onClick={this.openReplaceRechargeModal}
            style={{
              position: "absolute",
              right: "120px",
              borderColor: "#1890FF",
              color: "#1890FF"
            }}
          >?????????
          </Button>
        </>
      ),
      5: (
        <Authorized authority={[FUNDS_INSIDETRANSFER_WITHDRAWAL]}>
          <Button
            onClick={this.openWithdrawalModal}
            style={{ position: "absolute", right: "20px", borderColor: "#1890FF", color: "#1890FF" }}
          >??????
          </Button>
        </Authorized>
      ),
      11: (
        <Authorized authority={[FUNDS_TRANSFER_TO_BASIC_TAXPAYER]}>
          <Button
            onClick={this.openTransferOutModal}
            style={{ position: "absolute", right: "20px", borderColor: "#1890FF", color: "#1890FF" }}
          >??????
          </Button>
        </Authorized>
      )
    }[accountData.virtualAccountType];
    return (
      <div style={{ backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "10px", width: "97%", padding: "10px", marginTop : "0.7rem" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", lineHeight: "30px" }}>{name}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>???????????????{_name}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>??????:{accountData.virtualAccountNo}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>??????</div>
        <div
          style={{ fontSize: "22px", lineHeight: "35px", fontWeight: "bold", color: "#1890FF", position: "relative" }}
        >
          {shield ? "*****" :
            <>
              {formatMoney(accountData.virtualAccountBalance)}
              <span style={{ fontSize: "14px", lineHeight: "25px" }}>???</span>
            </>}
          {operation}
        </div>
        <h4>{formatTop(accountData.virtualAccountBalance)}</h4>
      </div>
    );
  };

  renderBankAccount = (type) => {
    const { accountData: { logisticsBankAccountEntities, shield, unrecordedRechargeAmount } } = this.state;
    const keyword = {
      1: "????????????",
      2: "???????????????",
      3: "????????????",
      4: "????????????",
      5: "????????????"
    }[type] || "????????????";
    const name = {
      1: "??????????????????",
      2: "????????????",
      3: "??????????????????",
      4: "??????????????????",
      5: "??????????????????"
    }[type] || "??????????????????";
    const accountData = logisticsBankAccountEntities.find(item => item.bankName.indexOf(keyword) > -1) || {};
    return (
      <div style={{
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: "10px",
        width: "97%",
        padding: "10px",
        marginTop: "10px"
      }}
      >
        <div style={{ fontSize: "16px", fontWeight: "bold", lineHeight: "30px" }}>{name}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>???????????????{accountData.invoiceTitle}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>???????????????{accountData.invoiceNo || "--"}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>????????????{accountData.bankName}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>?????????{accountData.bankAccount}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>??????</div>
        <div style={{ fontSize: "22px", lineHeight: "35px", fontWeight: "bold", color: "#1890FF" }}>
          {
            shield ? "*****" :
              <>
                {formatMoney(accountData.bankAccountBalance)}
                <span style={{ fontSize: "14px", lineHeight: "25px" }}>???</span>
                {unrecordedRechargeAmount && type=== 4 && <span style={{ marginLeft: "1rem", fontSize: "14px", }}>(?????????????????????{formatMoney(unrecordedRechargeAmount)}???)</span>}
              </>
          }
        </div>
        <h4>{formatTop(accountData.bankAccountBalance)}</h4>
      </div>
    );
  };

  renderList = index => {
    switch (index) {
      case 1:
        return (
          <>
            <Row>
              <Col span={8}>
                {this.renderVirtualAccount(4)}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                {this.renderBankAccount(4)}
              </Col>
            </Row>
          </>
        );
      case 2:
        return (
          <>
            <Row>
              <Col span={8}>
                {this.renderVirtualAccount(3)}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                {this.renderBankAccount(3)}
              </Col>
            </Row>
          </>
        );
      case 3:
        return (
          <>
            <Row>
              <Col span={8}>
                {this.renderVirtualAccount(5)}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                {this.renderBankAccount(5)}
              </Col>
            </Row>
          </>
        );
      case 4:
        return (
          <>
            <Row>
              <Col span={8}>
                {this.renderVirtualAccount(6)}
              </Col>
              <Col span={8}>
                {this.renderVirtualAccount(7)}
              </Col>
              <Col span={8}>
                {this.renderVirtualAccount(8)}
              </Col>
              <Col span={8}>
                {this.renderVirtualAccount(11)}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                {this.renderBankAccount(1)}
              </Col>
            </Row>
          </>
        );
      case 5:
        return (
          <>
            <Row>
              <Col span={8}>
                {this.renderVirtualAccount(9)}
              </Col>
              <Col span={8}>
                {this.renderVirtualAccount(10)}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                {this.renderBankAccount(2)}
              </Col>
            </Row>
            <p style={{ color: "gray", marginTop: "2em" }}>????????????20???????????????????????????????????????2????????????????????????????????????????????????????????????????????????
              ????????????????????????????????????20??????
            </p>
          </>
        );
      default:
        return "";
    }
  };

  postTransfer = (value, { setFields }) => {
    const { payerAccountType, payeeAccountType, transferAmount, remarks } = value;
    const { accountData: { logisticsBankAccountEntities = [], shield } } = this.state;
    // const { getInternalTransfers } = this.props
    const keywordType = {
      1: "????????????",
      2: "????????????",
      3: "????????????"
    };
    const payerKeyword = keywordType[payerAccountType] || "????????????";
    const payeeKeyword = keywordType[payeeAccountType] || "????????????";
    const payerAccount = logisticsBankAccountEntities.find(item => item.bankName.indexOf(payerKeyword) > -1) || {};
    const payeeAccount = logisticsBankAccountEntities.find(item => item.bankName.indexOf(payeeKeyword) > -1) || {};
    if (transferAmount > payerAccount.bankAccountBalance && !shield) {
      return setFields({ transferAmount: { errors: [new Error("????????????????????????")] } });
    }
    postInternalTransfer({
      payerAccountType,
      payerAccountName: payerAccount.bankName,
      payerAccount: payerAccount.bankAccount,
      payeeAccountType,
      payeeAccountName: payeeAccount.bankName,
      payeeAccount: payeeAccount.bankAccount,
      transferAmount,
      remarks
    })
      .then(() => {
        notification.success({
          message: "??????????????????"
        });
        this.closeTransferModal();
        return getAccountsInformation();
      })
      .then((accountData) => {
        this.setState({
          accountData
        });
      });
  };

  onSelect = index => {
    this.setState({
      index
    });
  };

  render() {
    const {
      ready,
      phone,
      transferModal,
      editAble,
      number,
      rechargeFormStatus,
      withdrawalModal,
      nextForm,
      submitData,
      replaceRechargeFormStatus,
      index,
      showTransferOutModal
    } = this.state;
    const tabs = [{ id: 1, name: "????????????" }, { id: 2, name: "????????????" }, { id: 3, name: "????????????" }, {
      id: 4,
      name: "????????????"
    }, { id: 5, name: "????????????" }];
    return (
      ready &&
      <>
        <div style={{ height: "50px", margin: "10px 0", position: "relative" }}>
          <span style={{ fontSize: "20px", lineHeight: "50px", fontWeight: "bold", color: "black" }}>??????????????????</span>
          {editAble
            ?
            <>
              <Input style={{ width: "130px", marginLeft: "10px" }} value={phone} disabled />
              <Input
                onChange={this.changeSmsCode}
                style={{ width: "130px", marginLeft: "10px" }}
                placeholder="??????????????????"
              />
              <Button
                disabled={number !== 60}
                style={{ marginLeft: "10px" }}
                type="primary"
                onClick={this.getSMScode}
              >???????????????{number === 60 ? "" : `(${number})`}
              </Button>
              <Input
                onChange={this.changeNewPhone}
                style={{ width: "200px", marginLeft: "10px" }}
                placeholder="????????????????????????????????????"
              />
              <Button style={{ marginLeft: "10px" }} type="primary" onClick={this.saveChange}>??????</Button>
              <Button style={{ marginLeft: "10px" }} onClick={this.cancelEdit}>??????</Button>
            </>
            :
            <>
              <span style={{ fontSize: "20px", lineHeight: "50px", marginLeft: "10px" }}>{phone || "?????????"}</span>
              <Authorized authority={[FUNDS_INSIDETRANSFER_CHANGE_PHONE]}>
                <Button style={{ position: "absolute", left: 300, margin: "9px" }} onClick={this.editPhone}>??????</Button>
              </Authorized>
            </>
          }
        </div>
        <Row
          style={{ height: "50px", margin: "10px 0", position: "relative" }}
          type="flex"
          align="middle"
          justify="space-between"
        >
          <Col>
            <Row type="flex" justify="start">
              {tabs.map(item => (
                <Col key={item.id}><span
                  styleName={index === item.id ? "defaultCss active" : "defaultCss"}
                  onClick={() => this.onSelect(item.id)}
                >{item.name}
                </span>
                </Col>
              ))}
            </Row>
          </Col>
          <Col>
            <Authorized authority={[FUNDS_INSIDETRANSFER_INTO_PROVISION]}>
              <Button type="primary" onClick={this.fundTransfer}>????????????</Button>
            </Authorized>
          </Col>
        </Row>
        {this.renderList(index)}
        <Modal
          visible={rechargeFormStatus}
          destroyOnClose
          title="????????????"
          onCancel={this.closeRechargeModal}
          footer={null}
        >
          <PlatRechargeForm phone={phone} closeForm={this.closeRechargeModal} />
        </Modal>
        <Modal
          destroyOnClose
          title="??????"
          footer={null}
          onCancel={() => this.setState({ showTransferOutModal: false })}
          visible={showTransferOutModal}
        >
          <TransferOutModal refresh={this.refresh} onCancel={() => this.setState({ showTransferOutModal: false })}  />
        </Modal>
        <Modal
          visible={replaceRechargeFormStatus}
          destroyOnClose
          width="750px"
          title="?????????"
          onCancel={this.closeReplaceRechargeModal}
          footer={null}
        >
          <ReplaceRecharge phone={phone} closeForm={this.closeReplaceRechargeModal} />
        </Modal>
        <Modal
          visible={transferModal}
          destroyOnClose
          title="????????????"
          onCancel={this.closeTransferModal}
          footer={null}
        >
          <SchemaForm {...formLayOut} schema={this.transferForm}>
            <Row>
              <Col span={10}>
                <Item field="payerAccountType" />
              </Col>
              <Col style={{ textAlign: "center" }} span={4}>
                <Icon style={{ color: "#1890FF" }} type="arrow-right" />
                <div>??????</div>
              </Col>
              <Col span={10}>
                <Item field="payeeAccountType" />
              </Col>
            </Row>
            <Item field="transferAmount" />
            <div style={{ fontWeight: "bold", lineHeight: "40px", color: "rgba(0, 0, 0, 0.85)" }}>?????????</div>
            <Item field="remarks" />
            <div style={{ textAlign: "right", marginTop: "15px" }}>
              <Button style={{ marginRight: "10px" }} onClick={this.closeTransferModal}>??????</Button>
              <DebounceFormButton label="??????" type="primary" onClick={this.postTransfer} />
            </div>
          </SchemaForm>
        </Modal>
        <Modal
          visible={withdrawalModal}
          destroyOnClose
          title="??????"
          onCancel={this.closeWithdrawalModal}
          footer={null}
        >
          {nextForm ?
            <>
              <SchemaForm {...formLayOut} schema={this.passFormSchema} data={{ phone }}>
                <div style={{ width: "380px", margin: "0 auto" }}>
                  <p style={{ color: "rgba(0,0,0,0.85)", fontSize: "14px", fontWeight: "bold" }}>???????????????:</p>
                  <p style={{ color: "black", fontSize: "23px", fontWeight: "bold" }}>{submitData.payeeAccount}</p>
                  <p>{submitData.payeeAccountName}</p>
                  <Item field="phone" />
                  <Item field="smsCode" />
                </div>
                <div style={{ textAlign: "right", marginTop: "25px" }}>
                  <Button style={{ marginRight: "10px" }} onClick={this.closeWithdrawalModal}>??????</Button>
                  <Button style={{ marginRight: "10px" }} onClick={this.lastStep}>?????????</Button>
                  <DebounceFormButton debounce label="??????" type="primary" onClick={this.submitWithdrawal} />
                </div>
              </SchemaForm>
            </>
            :
            <SchemaForm {...formLayOut} schema={this.withdrawalForm}>
              <Item field="transferAmount" />
              <p style={{ fontWeight: "bold", color: "#333", marginTop: "25px" }}>???????????????<span
                style={{ color: "#999999", fontSize: "12px" }}
              >(??????: ?????????????????????????????????????????????????????????)
              </span>
              </p>
              <Item field="payeeAccount" />
              <Item field="branchBanks" />
              <Item field="bankCode" />
              <div style={{ textAlign: "right", marginTop: "15px" }}>
                <Button style={{ marginRight: "10px" }} onClick={this.closeWithdrawalModal}>??????</Button>
                <DebounceFormButton label="?????????" type="primary" onClick={this.nextStep} />
              </div>
            </SchemaForm>
          }
        </Modal>
        {/* <div style={{ lineHeight:'30px', fontWeight:'bold', fontSize:'18px', margin:'10px 0', color:'black' }}>????????????</div>
        <Table
          schema={this.tableSchema}
          rowKey="internalTransferId"
          renderCommonOperate={this.searchTableList}
          pagination={{ current: nowPage, pageSize }}
          onChange={this.onChange}
          dataSource={internalTransferList}
        /> */}
      </>
    );
  }
}

export default FundAccount;
