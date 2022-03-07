import React, { Component } from "react";
import auth from "@/constants/authCodes";
import InvoicingList from "./components/InvoicingList";

const {
  CONSIGNMENT_INVOICE_MODIFY,
  SHIPMENT_INVOICE_MODIFY,
  SHIPMENT_INVOICE_JUDGE: INVOICE_JUDGE,
  SHIPMENT_INVOICE_SENDED: HAD_SENDED,
  SHIPMENT_INVOICE_EXPORT_DETAIL: GET_PDF,
  SHIPMENT_INVOICE_VISIT: DETAIL
} = auth;

export default class PlatformInvoicing extends Component {

  render() {
    return (
      <InvoicingList
        invoiceStateInit="1,2,3,4,5"
        authArr={{
          INVOICE_JUDGE,
          HAD_SENDED,
          GET_PDF,
          DETAIL,
          INVOICE_MODIFY: [CONSIGNMENT_INVOICE_MODIFY, SHIPMENT_INVOICE_MODIFY]
        }}
      />
    );
  }
}
