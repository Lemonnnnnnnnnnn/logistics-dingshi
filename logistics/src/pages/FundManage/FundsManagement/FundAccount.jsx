import React, { Component } from "react";
import { Row, Col, Button, Input, notification, message, Modal, Icon } from "antd";
import { SchemaForm, Item, Observer } from "@gem-mine/antd-schema-form";
import CSSModules from "react-css-modules";
import DebounceFormButton from "@/components/DebounceFormButton";
import "@gem-mine/antd-schema-form/lib/fields";
import moment from "moment";
import TableContainer from "@/components/Table/TableContainer";
import {
  getAuthorizationPhone,
  getAuthNotCode,
  changePaymentAuthorizationPhone,
  getAccountsInformation,
  postInternalTransfer,
  postWithdraw
} from "@/services/apiService";
import { isNumber, formatMoney, formatTop } from "@/utils/utils";
import GetSmsCode from "@/pages/Registered/GetSmsCode";
import Authorized from "@/utils/Authorized";
import auth from "@/constants/authCodes";
import styles from "@/pages/FundManage/FundsManagement/Customer.less";
import PlatRechargeForm from "./component/PlatRechargeForm";
import SelectBox from "./component/SelectBox";
import WithdrawalInput from "./component/WithdrawalInput";
import ReplaceRecharge from "./component/ReplaceRecharge";
import BranchBanksSelector from "./component/BranchBanksSelector";
import TransferOutModal from "./component/TransferOutModal";

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
      label: "转账状态",
      component: "select",
      options: [
        {
          label: "处理中",
          value: 0,
          key: 0
        },
        {
          label: "已完成",
          value: 1,
          key: 1
        },
        {
          label: "已失败",
          value: 2,
          key: 2
        }
      ],
      placeholder: "请选择转账状态"
    },
    transactionType: {
      label: "交易类型",
      placeholder: "请选择交易类型",
      component: "select",
      options: [{
        label: "客户转账",
        value: 1,
        key: 1
      }, {
        label: "转入备付金",
        value: 2,
        key: 2
      }, {
        label: "转入对公账户",
        value: 3,
        key: 3
      }, {
        label: "支付运费",
        value: 4,
        key: 4
      }, {
        label: "银联通道费",
        value: 5,
        key: 5
      }, {
        label: "中信通道费",
        value: 6,
        key: 6
      }, {
        label: "提现",
        value: 7,
        key: 7
      }, {
        label: "对公转入收入账户",
        value: 8,
        key: 8
      }, {
        label: "平台充值",
        value: 9,
        key: 9
      }, {
        label: "收入提现",
        value: 10,
        key: 10
      }, {
        label: "收入转入备付金",
        value: 11,
        key: 11
      }, {
        label: "货主手续费",
        value: 12,
        key: 12
      }, {
        label: "司机手续费",
        value: 13,
        key: 13
      }, {
        label: "手动提现",
        value: 14,
        key: 14
      }, {
        label: "承运手续费",
        value: 15,
        key: 15
      }, {
        label: "司机运费",
        value: 16,
        key: 16
      }]
    },
    rollTime: {
      label: "转入/转出日期",
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
          title: "转账状态",
          dataIndex: "transferState",
          fixed: "left",
          width: 140,
          render: (text) => ({
            0: "处理中",
            1: "已完成",
            2: "已失败"
          }[text])
        }, {
          title: "交易类型",
          dataIndex: "transactionType",
          render: (text) => ({}[text] || "暂无定义")
        }, {
          title: "交易编号",
          dataIndex: "transactionNo"
        }, {
          title: "付款方",
          dataIndex: "payerName",
          width: 250
        }, {
          title: "付款账号",
          dataIndex: "payerAccount"
        }, {
          title: "收款方",
          dataIndex: "payeeName"
          // render: text => ({
          //   1:'对公账户',
          //   2:'备付金账户'
          // }[text])
        }, {
          title: "收款账户",
          dataIndex: "payeeAccount"
        }, {
          title: "转入/转出时间",
          dataIndex: "rollTime",
          render: text => moment(text).format("YYYY/MM/DD HH:mm")
        }, {
          title: "汇款识别码",
          dataIndex: "remittanceIdentificationCode"
        }, {
          title: "金额（元）",
          dataIndex: "transactionAmount"
        }, {
          title: "备注",
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
            label: "收款平台账户"
          },
          {
            key: 3,
            value: 3,
            label: "收入平台账户"
          }
        ],
        rules: {
          required: [true, "请选择转账户"]
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
                label: "支付平台账户"
              },
              {
                key: 3,
                value: 3,
                label: "收入平台账户"
              }
            ];
            return {
              options: options.map(item => ({ ...item, disabled: `${item.value}` === `${payerAccountType}` })),
              value: `${value}` === `${payerAccountType}` ? undefined : value
            };
          }
        }),
        rules: {
          required: [true, "请选择转入账户"]
        }
      },
      transferAmount: {
        label: "划转金额",
        component: "input",
        allowClear: true,
        observer: Observer({
          watch: "payerAccountType",
          action: (payerAccountType) => {
            const { accountData: { logisticsBankAccountEntities = [] } } = this.state;
            const keyword = {
              1: "支付账户",
              2: "收款账户",
              3: "收入账户"
            }[payerAccountType] || "未知账户";
            const accountData = logisticsBankAccountEntities.find(item => item.bankName.indexOf(keyword) > -1) || {};
            return {
              placeholder: isNumber(accountData.bankAccountBalance) ? `可转金额${accountData.bankAccountBalance}元` : "请输入划转金额"
            };
          }
        }),
        addonAfter: "元",
        rules: {
          required: [true, "请输入划转金额"],
          validator: ({ value }) => {
            if (!/^\d+\.?\d{0,2}$/.test(value)) return "请正确输入划转金额!   (最高支持两位小数)";
            if (value <= 0) return "请正确输入划转金额!   (最高支持两位小数)";
          }
        }
      },
      remarks: {
        component: "input.textArea",
        placeholder: "请输入备注原因"
      }
    };
    this.passFormSchema = {
      phone: {
        component: "input.text",
        placeholder: "请输入手机号",
        rules: {
          required: [true, "请输入手机号"]
        }
      },
      smsCode: {
        component: GetSmsCode,
        needCheckCode: false,
        smsType: "WITHDRAWAL",
        rules: {
          required: [true, "请输入短信验证码"]
        },
        placeholder: "请输入短信验证码"
      }
    };
  }

  componentDidMount() {
    // const { getInternalTransfers } = this.props
    Promise.all([getAuthorizationPhone(), getAccountsInformation()])
      .then(([phoneData, accountData]) => {
        const keyword = "收入账户";
        const backAccount = accountData.logisticsBankAccountEntities.find(item => item.bankName.indexOf(keyword) > -1) || {};
        this.withdrawalForm = {
          transferAmount: {
            label: "提现金额",
            component: WithdrawalInput,
            maxMoney: backAccount.bankAccountBalance,
            rules: {
              required: [true, "请输入提现金额"],
              validator: ({ value }) => {
                if (!/^\d+\.?\d{0,2}$/.test(value)) return "请正确输入提现金额!   (最高支持两位小数)";
                if (value <= 0) return "请正确输入提现金额!   (最高支持两位小数)";
                if (value > backAccount.bankAccountBalance && !accountData.shield) return "超出可提现金额";
              }
            }
          },
          payeeAccount: {
            label: "银行卡号",
            component: "input",
            placeholder: "请输入提现银行卡",
            rules: {
              required: [true, "请输入银行账号"],
              validator: ({ value }) => {
                const reg = /^[0-9]*$/;
                if (!reg.test(value)) {
                  return "银行账号由数字构成";
                }
              }
            }
          },
          branchBanks: {
            label: "开户支行",
            component: BranchBanksSelector
          },
          bankCode: {
            label: "银行行号",
            component: "input",
            placeholder: "请输入提现银行行号",
            rules: {
              required: [true, "请输入提现银行行号"],
              validator: ({ value }) => {
                const reg = /^[0-9]*$/;
                if (!reg.test(value)) {
                  return "银行行号由数字构成";
                }
                if (value.length !== 12) {
                  return "银行行号由12位数字构成";
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
  //       <DebounceFormButton label="查询" type="primary" className="mr-10" onClick={this.handleSearchBtnClick} />
  //       <DebounceFormButton label="重置" className="mr-10" onClick={this.handleResetBtnClick} />
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
            message: "获取验证码失败",
            description: data && data.Message || "触发节流，请稍后获取验证码"
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
    if (!check) return message.error("请输入正确的手机号");
    if (!this.smsCode) return message.error("请输入正确的短信验证码");
    changePaymentAuthorizationPhone({
      oldPaymentAuthorizationPhone: phone,
      newPaymentAuthorizationPhone: this.newPhone,
      smsCode: this.smsCode
    })
      .then(() => {
        notification.success({
          message: "修改成功",
          description: "已成功修改授权人手机号"
        });
        this.setState({
          phone: this.newPhone
        });
        this.cancelEdit();
      })
      .catch((error) => {
        notification.error({
          message: "修改失败",
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
      submitData: { ...value, payeeAccountName: "福建鼎石科技有限公司" },
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
    const keyword = "收入账户";
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
          message: "发起提现成功"
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
      1: "系统平台账户",
      2: "银联平台账户",
      3: "支付平台账户",
      4: "收款平台账户",
      5: "收入平台账户",
      6: "代收平台账户",
      7: "微信代支付平台账户",
      8: "未入账资金平台账户",
      9: "微信平台账户",
      10: "微信设备保证金账户",
      11: "代扣税费账户",
      12: "代收招投标费账户"
    }[accountData.virtualAccountType] || "未知账户";
    const _name = {
      1: "平台-系统账户",
      2: "平台-银联账户",
      3: "平台-支付账户",
      4: "平台-收款账户",
      5: "平台-收入账户",
      6: "平台-代收账户",
      7: "平台-微信代支付账户",
      8: "平台-未入账资金账户",
      9: "平台-微信账户",
      10: "平台—微信设备保证金账户",
      11: "平台-代收账户",
      12: "平台-代收账户"
    }[accountData.virtualAccountType] || "未知";
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
            >平台充值
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
          >代充值
          </Button>
        </>
      ),
      5: (
        <Authorized authority={[FUNDS_INSIDETRANSFER_WITHDRAWAL]}>
          <Button
            onClick={this.openWithdrawalModal}
            style={{ position: "absolute", right: "20px", borderColor: "#1890FF", color: "#1890FF" }}
          >提现
          </Button>
        </Authorized>
      ),
      11: (
        <Authorized authority={[FUNDS_TRANSFER_TO_BASIC_TAXPAYER]}>
          <Button
            onClick={this.openTransferOutModal}
            style={{ position: "absolute", right: "20px", borderColor: "#1890FF", color: "#1890FF" }}
          >转出
          </Button>
        </Authorized>
      )
    }[accountData.virtualAccountType];
    return (
      <div style={{ backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "10px", width: "97%", padding: "10px", marginTop : "0.7rem" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", lineHeight: "30px" }}>{name}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>账户名称：{_name}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>账号:{accountData.virtualAccountNo}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>余额</div>
        <div
          style={{ fontSize: "22px", lineHeight: "35px", fontWeight: "bold", color: "#1890FF", position: "relative" }}
        >
          {shield ? "*****" :
          <>
            {formatMoney(accountData.virtualAccountBalance)}
            <span style={{ fontSize: "14px", lineHeight: "25px" }}>元</span>
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
      1: "代收账户",
      2: "备付金账户",
      3: "支付账户",
      4: "收款账户",
      5: "收入账户"
    }[type] || "未知账户";
    const name = {
      1: "代收银行账户",
      2: "微信账户",
      3: "支付银行账户",
      4: "收款银行账户",
      5: "收入银行账户"
    }[type] || "未知银行账户";
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
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>账户名称：{accountData.invoiceTitle}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>发票税号：{accountData.invoiceNo || "--"}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>开户行：{accountData.bankName}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>账号：{accountData.bankAccount}</div>
        <div style={{ fontSize: "14px", lineHeight: "25px" }}>余额</div>
        <div style={{ fontSize: "22px", lineHeight: "35px", fontWeight: "bold", color: "#1890FF" }}>
          {
            shield ? "*****" :
            <>
              {formatMoney(accountData.bankAccountBalance)}
              <span style={{ fontSize: "14px", lineHeight: "25px" }}>元</span>
              {unrecordedRechargeAmount && type=== 4 && <span style={{ marginLeft: "1rem", fontSize: "14px", }}>(其中未入账资金{formatMoney(unrecordedRechargeAmount)}元)</span>}
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
              <Col span={8}>
                {this.renderVirtualAccount(12)}
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
            <p style={{ color: "gray", marginTop: "2em" }}>说明：每20分钟查验微信账户余额，不足2万元时，由微信平台代支付账户自动转账至微信账户”
              检测微信账户余额时间间隔20分钟
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
      1: "支付账户",
      2: "收款账户",
      3: "收入账户"
    };
    const payerKeyword = keywordType[payerAccountType] || "未知账户";
    const payeeKeyword = keywordType[payeeAccountType] || "未知账户";
    const payerAccount = logisticsBankAccountEntities.find(item => item.bankName.indexOf(payerKeyword) > -1) || {};
    const payeeAccount = logisticsBankAccountEntities.find(item => item.bankName.indexOf(payeeKeyword) > -1) || {};
    if (transferAmount > payerAccount.bankAccountBalance && !shield) {
      return setFields({ transferAmount: { errors: [new Error("超出可转账的金额")] } });
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
          message: "发起转账成功"
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
    const tabs = [{ id: 1, name: "收款账户" }, { id: 2, name: "支付账户" }, { id: 3, name: "收入账户" }, {
      id: 4,
      name: "代收账户"
    }, { id: 5, name: "微信账户" }];
    return (
      ready &&
      <>
        <div style={{ height: "50px", margin: "10px 0", position: "relative" }}>
          <span style={{ fontSize: "20px", lineHeight: "50px", fontWeight: "bold", color: "black" }}>授权人手机号</span>
          {editAble
            ?
              <>
                <Input style={{ width: "130px", marginLeft: "10px" }} value={phone} disabled />
                <Input
                  onChange={this.changeSmsCode}
                  style={{ width: "130px", marginLeft: "10px" }}
                  placeholder="请输入验证码"
                />
                <Button
                  disabled={number !== 60}
                  style={{ marginLeft: "10px" }}
                  type="primary"
                  onClick={this.getSMScode}
                >获取验证码{number === 60 ? "" : `(${number})`}
                </Button>
                <Input
                  onChange={this.changeNewPhone}
                  style={{ width: "200px", marginLeft: "10px" }}
                  placeholder="请输入新的授权人手机号码"
                />
                <Button style={{ marginLeft: "10px" }} type="primary" onClick={this.saveChange}>保存</Button>
                <Button style={{ marginLeft: "10px" }} onClick={this.cancelEdit}>取消</Button>
              </>
            :
              <>
                <span style={{ fontSize: "20px", lineHeight: "50px", marginLeft: "10px" }}>{phone || "未添加"}</span>
                <Authorized authority={[FUNDS_INSIDETRANSFER_CHANGE_PHONE]}>
                  <Button style={{ position: "absolute", left: 300, margin: "9px" }} onClick={this.editPhone}>编辑</Button>
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
              <Button type="primary" onClick={this.fundTransfer}>资金划转</Button>
            </Authorized>
          </Col>
        </Row>
        {this.renderList(index)}
        <Modal
          visible={rechargeFormStatus}
          destroyOnClose
          title="平台充值"
          onCancel={this.closeRechargeModal}
          footer={null}
        >
          <PlatRechargeForm phone={phone} closeForm={this.closeRechargeModal} />
        </Modal>
        <Modal
          destroyOnClose
          title="转出"
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
          title="代充值"
          onCancel={this.closeReplaceRechargeModal}
          footer={null}
        >
          <ReplaceRecharge phone={phone} closeForm={this.closeReplaceRechargeModal} />
        </Modal>
        <Modal
          visible={transferModal}
          destroyOnClose
          title="资金划转"
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
                <div>转到</div>
              </Col>
              <Col span={10}>
                <Item field="payeeAccountType" />
              </Col>
            </Row>
            <Item field="transferAmount" />
            <div style={{ fontWeight: "bold", lineHeight: "40px", color: "rgba(0, 0, 0, 0.85)" }}>备注：</div>
            <Item field="remarks" />
            <div style={{ textAlign: "right", marginTop: "15px" }}>
              <Button style={{ marginRight: "10px" }} onClick={this.closeTransferModal}>取消</Button>
              <DebounceFormButton label="确认" type="primary" onClick={this.postTransfer} />
            </div>
          </SchemaForm>
        </Modal>
        <Modal
          visible={withdrawalModal}
          destroyOnClose
          title="提现"
          onCancel={this.closeWithdrawalModal}
          footer={null}
        >
          {nextForm ?
            <>
              <SchemaForm {...formLayOut} schema={this.passFormSchema} data={{ phone }}>
                <div style={{ width: "380px", margin: "0 auto" }}>
                  <p style={{ color: "rgba(0,0,0,0.85)", fontSize: "14px", fontWeight: "bold" }}>提现银行卡:</p>
                  <p style={{ color: "black", fontSize: "23px", fontWeight: "bold" }}>{submitData.payeeAccount}</p>
                  <p>{submitData.payeeAccountName}</p>
                  <Item field="phone" />
                  <Item field="smsCode" />
                </div>
                <div style={{ textAlign: "right", marginTop: "25px" }}>
                  <Button style={{ marginRight: "10px" }} onClick={this.closeWithdrawalModal}>取消</Button>
                  <Button style={{ marginRight: "10px" }} onClick={this.lastStep}>上一步</Button>
                  <DebounceFormButton debounce label="确定" type="primary" onClick={this.submitWithdrawal} />
                </div>
              </SchemaForm>
            </>
            :
            <SchemaForm {...formLayOut} schema={this.withdrawalForm}>
              <Item field="transferAmount" />
              <p style={{ fontWeight: "bold", color: "#333", marginTop: "25px" }}>提现银行卡<span
                style={{ color: "#999999", fontSize: "12px" }}
              >(说明: 提现银行卡所属需为福建鼎石科技有限公司)
              </span>
              </p>
              <Item field="payeeAccount" />
              <Item field="branchBanks" />
              <Item field="bankCode" />
              <div style={{ textAlign: "right", marginTop: "15px" }}>
                <Button style={{ marginRight: "10px" }} onClick={this.closeWithdrawalModal}>取消</Button>
                <DebounceFormButton label="下一步" type="primary" onClick={this.nextStep} />
              </div>
            </SchemaForm>
          }
        </Modal>
        {/* <div style={{ lineHeight:'30px', fontWeight:'bold', fontSize:'18px', margin:'10px 0', color:'black' }}>资金记录</div>
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
