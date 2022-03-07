import React, { ReactNode } from "react";

import dayjs from "dayjs";
import { message } from "antd";
import { isFunction, last } from "lodash";
import { getOSSToken } from "../../services/common";
import { IOSSTokenResponse, UpdateType } from "../../declares";
import styles from "./index.scss";

interface IProps {
  children: ReactNode;
  fileSuffix: string[]; //支持的上传格式
  renderMode?: UpdateType; // 上传的类型
  multiple?: boolean; //  是否支持上传多个文件
  onUpload?: (res: any) => void;
  size: number; // 文件大小
  accept: string; //文件上传进行提交的文件类型\
  loading?: boolean; //是否在上传中
  setLoading: (bool: boolean) => void;
  disable: boolean; // 是否禁用
}
function getAccessInfo() {
  return getOSSToken();
}
function getTempNameWithKey(name: string) {
  const nowDate = dayjs(new Date()).format("YYYY/MM/DD");
  return `tender/temp/${nowDate}/${
    name
      .replace(/\.([^.]+)$/, `|&|_KEY_${new Date().getTime()}.$1`)
      .split("|&|")[1]
  }`;
  // return `temp/${nowDate}/${name.replace(/\.([^.]+)$/, `_KEY_${new Date().getTime()}.$1`)}`
}

function getBusinessNameWithKey(name: string) {
  const nowDate = dayjs(new Date()).format("YYYY/MM/DD");
  return `tender/business/${nowDate}/${
    name
      .replace(/\.([^.]+)$/, `|&|_KEY_${new Date().getTime()}.$1`)
      .split("|&|")[1]
  }`;
  // return `business/${nowDate}/${name.replace(/\.([^.]+)$/, `_KEY_${new Date().getTime()}.$1`)}`
}

function tempNameToBusinessName(name: string) {
  return name.replace("tender/temp", "tender/business");
}
const Upload: React.FunctionComponent<IProps> = ({
  children,
  onUpload,
  accept,
  renderMode,
  fileSuffix,
  multiple,
  size,
  disable,
  setLoading
}): JSX.Element => {
  let inputInstance: HTMLInputElement | null;

  const uploadFile = (
    {
      credentials: { accessKeyId, accessKeySecret, securityToken }
    }: IOSSTokenResponse,
    file: Blob
  ) =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result], { type: file.type });
        const { ossEndpoint, ossBucket } = window.env;
        import("ali-oss").then(({ default: OSS }) => {
          const client = new OSS({
            accessKeyId,
            accessKeySecret,
            stsToken: securityToken,
            endpoint: ossEndpoint,
            bucket: ossBucket.dev
          });
          resolve(client.put(getBusinessNameWithKey(file.name), blob));
        });
      };
      reader.readAsArrayBuffer(file);
    });
  const uploadIfNeeded = () => {
    if (inputInstance && inputInstance.files) {
      if (inputInstance.files.length) {
        setLoading(true);
      }
      const file = inputInstance.files[0];
      const fileSize = (file?.size / 1024).toFixed(2);
      if (renderMode !== UpdateType.Img && fileSuffix.length !== 0) {
        const fileType = last(file.name.split(".")) || "";
        const isHas = fileSuffix.findIndex(
          (item: string) => item.toLowerCase() === fileType.toLowerCase()
        );
        if (isHas === -1) {
          message.error("不支持的文件类型");
          setLoading(false);
          return;
        }
      }
      if (size !== undefined && Number(fileSize) > size) {
        message.error(`当前文件${fileSize}KB 超过了限制大小${size}KB`);
        return;
      }
      if (file) {
        getAccessInfo()
          .then(accessInfo => uploadFile(accessInfo, file))
          .then((data: any) => {
            const tempName = data.name;
            const res = {
              oldName: file.name,
              showFileName: tempName,
              fileName: tempNameToBusinessName(tempName)
            };
            if (isFunction(onUpload)) {
              onUpload(res);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  };

  const openUpload = () => {
    if (inputInstance) {
      inputInstance.click();
    }
  };
  return (
    <div onClick={openUpload} className={styles.uploadBox}>
      <input
        onChange={uploadIfNeeded}
        ref={fileInput => (inputInstance = fileInput)}
        accept={accept}
        type="file"
        disabled={disable}
        multiple={multiple}
        style={{ display: "none" }}
      />
      {children}
    </div>
  );
};
export default Upload;
