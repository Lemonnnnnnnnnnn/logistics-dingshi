import { CAR_AUDIT_STATUS } from '@/constants/car';
import request from '@/utils/request';

export const getAuditStatus = ({ auditStatus, perfectStatus }) => {
  let status = CAR_AUDIT_STATUS.UNAUDITED;
  if (auditStatus === 1) {
    switch (perfectStatus) {
      case 0:
        status = CAR_AUDIT_STATUS.FAIL;
        break;
      case 1:
        status = CAR_AUDIT_STATUS.SUCCESS;
        break;
      case 2:
        status = CAR_AUDIT_STATUS.PART_SUCCESS;
        break;
      case 3:
        status = CAR_AUDIT_STATUS.PART_SUCCESS;
        break;
      case 4:
        status = CAR_AUDIT_STATUS.EXPIRE;
        break;
      default:
    }
  }
  return status;
};

export const getCertificationStatus = ({ auditStatus, perfectStatus }) => {
  let status = CAR_AUDIT_STATUS.UNAUDITED;
  if (auditStatus === 1) {
    switch (perfectStatus) {
      case 0:
        status = CAR_AUDIT_STATUS.FAIL;
        break;
      case 1:
        status = CAR_AUDIT_STATUS.SUCCESS;
        break;
      case 2:
        status = CAR_AUDIT_STATUS.PART_SUCCESS;
        break;
      case 3:
        status = CAR_AUDIT_STATUS.UNAUDITED;
        break;
      case 4:
        status = CAR_AUDIT_STATUS.EXPIRE;
        break;
      default:
    }
  }
  return status;
};

export const driverCarApply = params => request.get('/v1/driverCarApply', { params });

export const editCar = (carId, params) => request.patch(`/v1/cars/${carId}`, { data: params });

// ocr识别
export const ocrVehicleLicenseOcr = params => request.get(`/v1/cars/ocrVehicleLicenseOcr`, { params });

// 车辆列表导出
export const exportCarsExcel = params => request.get('/v1/cars/excel', { params });

export default {};
