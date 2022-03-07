import React, { useEffect, useState } from "react";
import styles from "@/page/notice/components/notice-detail-header/index.scss";
import { ShareAltOutlined } from "@ant-design/icons";
import { Button, Modal, message, Row } from "antd";
import copy from "copy-to-clipboard";
import { getTenderShare } from "@/services/home";
import { getBaseUrl } from "@/utils/utils";

interface IProps {
  tenderId: number;
  isLogin: boolean;
}

const ShareLink: React.FC<IProps> = ({ tenderId, isLogin }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  useEffect(() => {
    if (isLogin) {
      getTenderShare(tenderId).then((code: number) =>
        setLinkUrl(
          `${getBaseUrl()}tender/notice/noticeDetail?tenderId=${tenderId}&sysCode=${String(
            code
          )}`
        )
      );
    }
  }, []);

  const copyUrl = () => {
    copy(linkUrl);
    message.success("复制成功");
  };

  return (
    <div>
      <Modal
        title="分享"
        visible={modalVisible}
        maskClosable={false}
        footer={null}
        width={540}
        centered
        onCancel={() => {
          setModalVisible(false);
        }}
      >

        <div className="m-3">
        <div className="text-large mb-2">分享招标信息给朋友</div>
        <Row align='middle'  style={{ height: "50px" }}>
          {/*<Input  />*/}
          <div className="text-center" style={{width : '270px' , lineHeight:"32px" ,  border : '1px solid #ccc'}}>
          24小时内有效
          </div>
          <Button  type="primary" onClick={() => copyUrl()}>
            复制链接
          </Button>
        </Row>
        </div>
      </Modal>
      <div className={styles.noticeDetailHeaderShare}>
        <ShareAltOutlined />
        <span
          style={{ textAlign: "right", color: "#14428A", cursor: "pointer" }}
          className="text-large ml-1"
          onClick={() => setModalVisible(true)}
        >
          分享
        </span>
      </div>
    </div>
  );
};

export default ShareLink;
