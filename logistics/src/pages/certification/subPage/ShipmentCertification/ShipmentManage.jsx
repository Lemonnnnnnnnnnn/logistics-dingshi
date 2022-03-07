import React from 'react'
import { FORM_MODE } from '@gem-mine/antd-schema-form'
import DebounceFormButton from '@/components/DebounceFormButton';
import OrganizationManage from '../OrganizationCertification/OrganizationManage'
import { SHIPMENT_OBJ } from '@/constants/organization/organizationType'

const { ADD, DETAIL } = FORM_MODE

export default ({ location }) => {
  const { organizationId: organizationsId } = location.query
  const mode = location.pathname.endsWith('detail') ? DETAIL : ADD

  return <OrganizationManage organizationsId={organizationsId} mode={mode} organization={SHIPMENT_OBJ} />
}
