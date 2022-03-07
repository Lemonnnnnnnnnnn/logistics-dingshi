## 项目名称
招投标平台

## 项目简介
易键达物流招投标平台用于物流运输业务的招投人业务，主要形式为招标人发布运输需求，承运方在平台上应标，通过公平竞争，择优选择运输公司，优化资源配置。
## 运行项目
npm run build

## 打包测试
npm run beta

## 打包生产
npm run prod

### 路由配置

  1、主页菜单的页面路由带有参数isMenu

  2、如果要啊在面包屑导航上提现一层一层关系需要嵌套配置路由（routes）且有name属性

使用懒加载（react-loadable）

  1、引入依赖包 （import Loadable from "react-loadable";）

  2、定义组件块

  const Main = Loadable({

    loader: () => import("url"),

    loading: Loading

  }); // url: 组件路径   Loading: 加载时候的组件
  ## 时间插件
  由于moment已经停止维护所有选择dayjs

  官方文档：https://dayjs.fenxianglu.cn

### git commit 规范

  feat：新功能（feature）

  fix：修补bug

  style： 格式（不影响代码运行的变动）

  refactor：重构（即不是新增功能，也不是修改bug的代码变动）

  一般情况下使用前3个


## 文件目录说明

  /src (开发目录)

    assets (资源文件夹)

    components (公用组件文件夹)

    layouts (页面布局) 开发的时候菜单和header就可以放文件夹里面 在default中使用

    models (状态管理)

    page （页面）

    servers (接口文件夹)

    utils (工具)

    common.css 公共样式

  .commitlintrc.js (commit规范配置)

  .editorconfig (项目编码规范)

  .eslintrc  (es规范)

  .gitignore (git提交的时候要忽略的文件)

  .postcssrc (解析预处理 使其兼容浏览器)

  .tsconfig (项目编译配置)

  .tslint.json  (ts规则配置)

### 项目新建文件夹命名规范

  1、系统每一个菜单就新建一个文件夹 一层一层套

  2、类型声明文件(declares文件夹下)、接口声明文件(servers文件夹下)、models(models文件夹下)这些命名都尽量保持一致，这样一看文件夹名字就知道对应的是那些

  3、文件和文件夹名字采用（xx-xx）全部小写格式 不用驼峰

  4、每个页面对应的页面在页面文件夹下的components里面，公用组件在src/components


## 页面规范
  1、页面文字统一用#333， 浅一点的文字用#999

  2、页面边框颜色统一用#ccc

  3、块与块之间的间距、padding统一用20px

  4、本项目的本地存储统一用”tander-**“开头

## 指南文档

  - 看板用法指南: [board-guide.md](docs/board-guide.md)

  - 代码风格指南: [code-guide.md](docs/code-guide.md)

  - Git 团队协作指南: [git-guide.md](docs/git-guide.md)

  - 代码版本号规则: [version-guide.md](docs/version-guide.md)

  ### 组件使用方法参照page/demo/index（路由配置该路由注销如果要看效果自行放开）




