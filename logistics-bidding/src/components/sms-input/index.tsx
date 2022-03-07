import { Button, Input, message } from "antd";
import React, { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./index.scss";
import { putSendSms } from "@/services/common";
import { IAuthsendsms } from "@/declares";

interface IProps {
  mobile?: string;
  code: string;
  template: string; // 手动点击发送验证码的template字符串
  sendSms?: any; // 进入页面就发送验证码的调用接口
  startTime?: string; // 进入页面就发送验证码
  localStorageKey?: string; //存入本地的key名
  setCode: (text: string) => void;
  submitMobile?: string;
  type: string;
}

const timeLength = 60;

const SmsInput: React.FunctionComponent<IProps> = ({
  mobile = "",
  code,
  sendSms,
  localStorageKey = "smsTime",
  startTime = "",
  submitMobile = "",
  template,
  setCode,
  type
}): JSX.Element => {
  const [timerID, setTimerID] = useState(false);
  const [time, setTime] = useState<string | number>("--");
  let timer: any = null;
  useEffect(() => {
    const localTime = localStorage.getItem(localStorageKey);
    if (localTime) {
      const second = Number(localTime) - dayjs().valueOf();
      timer = setInterval(() => {
        clearInterval(timer);
        setTime(Math.floor(second / 1000));
        if (second < 1) {
          clearInterval(timer);
          setTime(timeLength);
          localStorage.removeItem(localStorageKey);
          setTimerID(false);
        }
      }, 1000);
    } else if (!startTime) {
      clearInterval(timer);
      setTime("--");
    }
    return () => {
      clearInterval(timer);
    };
  }, [timerID, time]);
  useEffect(() => {
    // 如果有开始解锁时间就开始解锁时间后的60秒后可重新发送 如果没有开始解锁时间就当前时间的60秒后可重新发送
    const currentTime = startTime ? dayjs(startTime) : dayjs();
    if (sendSms) {
      if (dayjs().diff(currentTime, "second") > 60 || !startTime) {
        sendSms().then(() => {
          localStorage.setItem(
            localStorageKey,
            `${dayjs()
              .add(60, "second")
              .valueOf()}`
          );
          setTimerID(true);
          message.success("发送短信成功！");
        });
      } else {
        localStorage.setItem(
          localStorageKey,
          `${currentTime.add(60, "second").valueOf()}`
        );

        setTimerID(true);
      }
    }
  }, [startTime]);

  const onSubmit = useCallback(() => {
    if (mobile || submitMobile) {
      putSendSms(submitMobile || mobile, template).then(res => {
        localStorage.setItem(
          localStorageKey,
          `${dayjs()
            .add(timeLength, "second")
            .valueOf()}`
        );
        message.success("发送短信成功！");
        setTimerID(true);
      });
    } else {
      message.info("获取验证码失败！");
    }
  }, [mobile]);
  const onChange = e => {
    const reg = /^\d*$/;
    const value = e.target.value;
    if (!reg.test(value)) {
      return setCode(value.slice(0, -1));
    }
    return setCode(value);
  };
  return (
    <div className={styles.smsBox}>
      {mobile ? (
        <p style={{ marginBottom: "20px" }}>
          请输入短信验证码 <span>授权手机号：{mobile}</span>
        </p>
      ) : null}

      <div className={styles.smsInput}>
        <Input maxLength={6} onChange={onChange} value={code} />
        <Button onClick={onSubmit} disabled={timerID}>
          {timerID ? `重新获取验证码(${time})` : "获取验证码"}
        </Button>
      </div>
    </div>
  );
};
export default SmsInput;
