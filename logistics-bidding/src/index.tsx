import dva from "dva";
import createLoading from "dva-loading";
import { createBrowserHistory as createHistory } from "history";
import "./common.scss";

const app = dva({
  history: createHistory({ basename: "/tender/" })
});
app.use(createLoading());
app.model(require("./models/common").default);
app.model(require("./models/tender-manage").default);
app.model(require("./models/bidding-manage").default);
app.model(require("./models/home").default);
// tslint:disable-next-line:no-var-requires
app.router(require("./page/container").default);
app.start("#app");
