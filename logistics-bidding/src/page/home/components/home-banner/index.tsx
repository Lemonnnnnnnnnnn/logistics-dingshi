import React, { useEffect, useState } from "react";
import { Carousel, List } from "antd";
import styles from "./index.scss";
import { ICategory } from "@/declares";
import { History } from "history";
import { getBanner } from "@/services/common";
import { xmlStr2json } from "@/utils/utils";
import { flattenDeep } from "lodash";

interface IProps {
  history: History;
  categoryList: ICategory[];
}

const HomeBanner: React.FC<IProps> = ({
  categoryList,
  history
}): JSX.Element => {
  const routerTurnToNotice = (categoryId: number, categoryName: string) => {
    history.push({ pathname: "/notice", state: { categoryId, categoryName } });
  };
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    getBanner().then(response => {
      const obj = xmlStr2json(response).rss
        ? xmlStr2json(response).rss.channel
        : { item: [] };
      const arr: any[] = [];
      obj.item?.forEach(item => {
        const article = flattenDeep([item]);
        const latestItem = article.find(i =>
          flattenDeep([i.category]).some(
            _item => _item.indexOf("visible") !== -1
          )
        );
        if (latestItem) {
          arr.push({
            url: item["content:encoded"].split("(")[1].split(")")[0],
            href: item.link
          });
        }
      });
      setList(arr);
    });
  }, []);
  return (
    <div className={`center-main ${styles.banner}`}>
      <div className={styles.bannerLeft}>
        <h1>货品类目</h1>
        <ul>
          {categoryList.map(item => (
            <li
              style={{ cursor: "pointer" }}
              onClick={() =>
                routerTurnToNotice(item.categoryId, item.categoryName)
              }
              key={item.categoryId}
            >
              {item.categoryName}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.bannerRight}>
        <Carousel autoplay>
          {list.map(item => (
            <div key={item.url}>
              <a href={item.href}>
                <img src={item.url} alt="" />
              </a>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default HomeBanner;
