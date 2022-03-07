export const getTransferState = record => ({
  0: '未转入备付金',
  1: '已转入备付金',
  2: '转账失败'
}[record.transferState])

export const getBusinessAccount = bankInvoiceList => getBankAccountByType(bankInvoiceList, 1)

export const getProvisionsAccount = bankInvoiceList => getBankAccountByType(bankInvoiceList, 2)

export const getProvisionsVirtualAccount = platformVirtualAccount => getPlatformVirtualAccount(platformVirtualAccount, 2)

export const getBussinessVirtualAccount = platformVirtualAccount => getPlatformVirtualAccount(platformVirtualAccount, 4)

const getPlatformVirtualAccount = (platformVirtualAccount, type) => platformVirtualAccount.find(item => item.virtualAccountType === type ) || {}

const getBankAccountByType = (bankInvoiceList, type) => bankInvoiceList.find(item => item.cardAccountType === type && item.isAvailable )|| {}

export default {

}
