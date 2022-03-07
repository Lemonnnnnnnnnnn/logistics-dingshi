import React, { useState, useEffect } from "react";
import { Checkbox, Form, FormInstance, Input, Select } from "antd";
import styles from "./index.scss";

interface IProps {
  index: number;
  dataItem: any;
  form: FormInstance;
}

const InputResultItem: React.FC<IProps> = ({ index, dataItem, form }) => {
  const currentPackage = form.getFieldValue("tenderPackageEvaluationReqs")[
    dataItem.name
  ];
  const [renderCandidate, setRenderCandidate] = useState(true);
  useEffect(() => {
    // getEvaluation(tenderId);
    if(currentPackage.isAbortive) {
      setRenderCandidate(false);
    }
    console.log(currentPackage, "currentPackage")
  }, [currentPackage]);
  const onClickIsAbortive = (val: any) => {
    setRenderCandidate(!val.target.checked);
  };

  return (
    <div className={styles.inputResultItem}>
      <div className={styles.inputResultItemTitle}>
        第{index}包 {currentPackage.tenderPackageTitle}
      </div>

      <div className={styles.inputResultItemSmallTitle}>
        <span>评标结果</span>
        <Form.Item name={[dataItem.name, "isAbortive"]} valuePropName="checked">
          <Checkbox onChange={onClickIsAbortive}>流标</Checkbox>
        </Form.Item>
      </div>
      {(renderCandidate && (
        <Form.List name={[dataItem.name, "organizationEvaluationReqs"]}>
          {(fields, { add, remove }) => (
            <>
              {fields.length ? (
                fields.map((field, i) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "20px"
                    }}
                    key={field.key}
                  >
                    <Form.Item
                      name={[field.name, "organizationId"]}
                      label={`第${i + 1}侯选人`}
                      style={{ width: "300px" }}
                      rules={[
                        {
                          required: true,
                          message: "请选择对应候选人！"
                        }
                      ]}
                    >
                      <Select placeholder="请选择">
                        {currentPackage.orgDataResps.map(item => (
                          <Select.Option
                            value={item.organizationId}
                            key={item.organizationId}
                          >
                            {item.organizationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "isWinBid"]}
                      style={{ marginLeft: "20px" }}
                      valuePropName="checked"
                    >
                      {/*<Checkbox.Group options={[{ label: "中标", value: 1 }]} />*/}
                      <Checkbox>中标</Checkbox>
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "bidderSequence"]}
                      style={{ display: "none" }}
                      initialValue={i + 1}
                    >
                      <Input />
                    </Form.Item>
                    {i ? (
                      <div
                        onClick={() => remove(field.name)}
                        style={{ color: "#1890ff", cursor: "pointer" }}
                      >
                        删除
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <>暂无候选人</>
              )}
              {currentPackage.orgDataResps.length ? (
                <div
                  onClick={add}
                  style={{ color: "#1890ff", cursor: "pointer" }}
                >
                  添加
                </div>
              ) : null}
            </>
          )}
        </Form.List>
      )) ||
        null}
    </div>
  );
};

export default InputResultItem;
