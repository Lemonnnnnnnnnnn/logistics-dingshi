import React, { Component } from "react";
import { Button, notification, Select } from "antd";
import CSSModules from "react-css-modules";
import { Item } from "@gem-mine/antd-schema-form";
import { getOrganizations, manualEntryToAccount, getAuthorizationPhone } from "@/services/apiService";
import GetSmsCode from "@/pages/Registered/GetSmsCode";
import SearchForm from "@/components/Table/SearchForm2";
import DebounceFormButton from "@/components/DebounceFormButton";
import styles from "./ManualEntryModel.less";
import { ORGANIZATION_TEXT } from "@/constants/organization/organizationType";

@CSSModules(styles, { allowMultiple: true })
export default class ManialEntryModal extends Component {

  state = {
    ready: false,
    sendPassWord: false,
    customerOrganizationId: "",
    options: []
  };

  formLayOut = {
    labelCol: {
      xs: { span: 6 }
    },
    wrapperCol: {
      xs: { span: 18 }
    }
  };

  componentDidMount() {
    Promise.all([getAuthorizationPhone(), getOrganizations({
      organizationTypeList: "4,5",
      selectType: "1",
      offset: 0,
      limit: 100000
    })])
      .then(res => {
        const schema = {
          smsCode: {
            component: GetSmsCode,
            needCheckCode: false,
            callback: () => {
              this.setState({ sendPassWord: true });
            },
            smsType: "PAY_ORDER",
            rules: {
              required: [true, "请输入验证码"]
            }
          },
          phone: {
            name: "手机号",
            component: "hide",
            value: res[0].paymentAuthorizationPhone,
            defaultValue: res[0].paymentAuthorizationPhone
          }
        };
        this.setState({
          authorizationPhone: res[0].paymentAuthorizationPhone,
          schema,
          options: res[1].items.map(item => ({
            label: item.organizationName,
            value: item.organizationId,
            organizationType: item.organizationType
          })),
          ready: true
        });
      });
  }

  confirmCancel = (formdata) => {
    const { customerOrganizationId } = this.state;
    const { smsCode } = formdata;
    const { authorizationPhone } = this.state;
    if (!customerOrganizationId) {
      notification.info({ message: "请输入货主名称" });
      return;
    }
    const { rechargeId } = this.props;
    manualEntryToAccount({ smsCode, customerOrganizationId, authorizationPhone, rechargeId }).then(() => {
      notification.success({ message: "上账成功" });
      this.props.toggleCancelModal();
      this.props.refresh();
    });
  };

  onSelectOrganization = (val) => {
    this.setState({ customerOrganizationId: val });
  };

  render() {
    const { ready, authorizationPhone, schema, sendPassWord, options } = this.state;

    return (ready &&
      <div styleName="manualEntryModal">
        <SearchForm layout="inline" schema={schema}>
          <div style={{ margin: "0 auto", width: "80%" }}>
            <div style={{ marginBottom: "20px" }}>货主名称</div>
            <Select
              onChange={this.onSelectOrganization}
              placeholder="请输入货主名称"
              style={{ width: "15rem" }}
              showSearch
              optionFilterProp="children"
              // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {options.map(item => (
                <Select.Option
                  value={item.value}
                >{item.label}-{ORGANIZATION_TEXT[item.organizationType]}
                </Select.Option>))}
            </Select>

            <div style={{ marginBottom: "20px", marginTop: "50px" }}>授权手机号</div>
            <div style={{ marginBottom: "20px", width: "80%", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: "bold" }}>{authorizationPhone}</div>
              {sendPassWord && <div>已发送验证码到手机</div>}
            </div>
            <Item field="phone" />
            <Item field="smsCode" />
            <div style={{ textAlign: "right", marginTop: "25px" }}>
              <Button className="mr-10" type="default" onClick={this.props.toggleCancelModal}>取消</Button>
              <DebounceFormButton label="确认" type="primary" onClick={this.confirmCancel} />
            </div>
          </div>
        </SearchForm>
      </div>
    );
  }
}
