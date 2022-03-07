import React, { useMemo, useState, useEffect } from "react";
import { Button, message, Image, Row } from "antd";
import { cloneDeep, isFunction, uniq } from "lodash";
import {
  CloseOutlined,
  LoadingOutlined,
  PlusOutlined
} from "@ant-design/icons";
import Upload from "./upload";
import styles from "./index.scss";
import { getOssImg } from "@/utils/utils";
import { UpdateType } from "@/declares";

interface IProps {
  extra?: string; // 说明描述
  fileSuffix?: string[]; //支持的上传格式
  renderMode?: UpdateType; // 上传的类型
  size?: number; // 大小
  multiple?: boolean; //  是否支持上传多个文件
  onUpload?: (res: string, del?: boolean) => void;
  accept?: string; //文件上传进行提交的文件类型
  title?: string; // 上传的title
  maxLength?: number; // 可以上传多少个文件
  showDownload?: boolean; // 是否显示下载按钮
  disable?: boolean; // 是否禁用
  showList?: string[]; // 上传的字段
}

const UploadX: React.FC<IProps> = (props): JSX.Element => {
  const {
    extra,
    renderMode = UpdateType.Img,
    title = "上传",
    accept = "image/*",
    fileSuffix = [],
    onUpload,
    size = 100 * 1024,
    maxLength = 1,
    showDownload = false,
    disable = false,
    showList
  } = props;
  const [loading, setLoading] = useState(false);
  const [imgUrlList, setImgUrlList] = useState<string[]>([]);
  const reg = /\.(png|jpg|gif|jpeg|webp)$/;
  useEffect(() => {
    setImgUrlList(uniq(showList) || []);
  }, [showList]);

  const getOriginalName = (nameWithKey: string, mode: UpdateType) => {
    if (mode === UpdateType.Btn) {
      const tempFileName = nameWithKey.replace(/_KEY_[^.]+/, "");
      const index = tempFileName.lastIndexOf("/");
      const fileName = tempFileName.substring(index + 1, tempFileName.length);
      return fileName;
    }
    return nameWithKey.replace(/_KEY_[^.]+/, "");
  };
  const onUploaded = (res: any) => {
    if (isFunction(onUpload)) {
      const list = cloneDeep(imgUrlList);
      if (list.length >= maxLength) {
        message.info("上传失败，上传数量已超过最大数量！");
      } else {
        if (reg.test(res.showFileName)) {
          list.push(res.showFileName);
        } else {
          list.push(res.oldName);
        }
        onUpload(res.fileName);
      }
      setImgUrlList(list);
    }
  };

  const stopPropagation = e => {
    e.stopPropagation();
  };
  const renderChildren = useMemo(() => {
    let upload;
    switch (renderMode) {
      case UpdateType.Img:
        upload = (
          <div className={styles.uploadImgBox}>
            {loading ? (
              <LoadingOutlined />
            ) : (
              <>
                <PlusOutlined />
                <span title={title}>{title}</span>
              </>
            )}
          </div>
        );
        break;
      case UpdateType.Btn:
        upload = (
          <div className={styles.uploadBtnBox}>
            <>
              <Button>{loading ? <LoadingOutlined /> : title}</Button>
              {extra ? <span onClick={stopPropagation}>{extra}</span> : null}
            </>
          </div>
        );
        break;
      default:
        upload = <Button icon="upload">{title}</Button>;
    }
    return upload;
  }, [loading, imgUrlList]);

  const onDelete = (item: string) => () => {
    const list = cloneDeep(imgUrlList).filter(path => path !== item);
    setImgUrlList(uniq(list));
    if (isFunction(onUpload)) {
      onUpload(item, true);
    }
  };
  const renderIcon = (str: string) => {
    if (/\.(doc|docx)$/.test(str)) {
      return "file-word-fill.png";
    } else if (/\.(xlsx|xls)$/.test(str)) {
      return "file-excel-fill.png";
    } else if (/\.(pdf)$/.test(str)) {
      return "bg-pdf.png";
    } else {
      return "24gf-fileEmpty.png";
    }
  };
  const renderImg = useMemo(() => {
    return imgUrlList.length
      ? imgUrlList.map(item => (
          <div
            className={styles.uploadImgItem}
            key={item}
            style={
              reg.test(item)
                ? { width: 100, padding: 6 }
                : {
                    minWidth: 100,
                    width: "auto",
                    // border: "1px solid #ccc",
                    padding: 16
                  }
            }
          >
            <div>
              {reg.test(item) ? (
                <Image width={100} src={getOssImg(item)} />
              ) : (
                <div>
                  <Row justify="center">
                    <img
                      src={require(`../../assets/imgs/${renderIcon(item)}`)}
                      alt=""
                      style={{ width: "50px" }}
                    />
                  </Row>
                  <div>
                    {getOriginalName(
                      item.includes("_KEY_") ? item.split("_KEY_")[1] : item,
                      renderMode
                    )}
                  </div>
                </div>
              )}
            </div>
            {!disable && <CloseOutlined onClick={onDelete(item)} />}
            <Row justify="space-around" style={{ border: 0 }}>
              {/* <p> */}
              {showDownload ? (
                <a className="text-link" href={getOssImg(item)}>
                  下载
                </a>
              ) : null}

              {!disable && (
                <div onClick={onDelete(item)} className="text-link">
                  删除
                </div>
              )}
              {/* </p> */}
            </Row>
          </div>
        ))
      : null;
  }, [imgUrlList]);
  return (
    <div
      className={styles.upload}
      style={
        renderMode === UpdateType.Img
          ? { flexDirection: "row" }
          : { flexDirection: "column" }
      }
    >
      {renderMode === UpdateType.Img ? renderImg : null}
      {maxLength === imgUrlList.length || disable ? null : (
        <Upload
          size={size}
          accept={accept}
          fileSuffix={fileSuffix}
          setLoading={setLoading}
          onUpload={onUploaded}
          disable={disable}
        >
          {renderChildren}
        </Upload>
      )}
      <div className={styles.uploadFileList}>
        {renderMode !== UpdateType.Img ? renderImg : null}
      </div>
    </div>
  );
};
export default UploadX;
