import { Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { App, NoComponent } from "./app";
import "./styles/reset.css";
import "./styles/normalize.css";
import "./styles/colors.css";
import "./styles/typography.css";
import "./styles/layout.css";
import "./styles/input.css";

const Home = lazy(() => import("./pages/home/home"));
const PrejoinForm = lazy(() => import("./pages/prejoin/prejoinForm"));
const Room = lazy(() => import("./pages/room/room"));

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/prejoin" component={PrejoinForm} />
      <Route path="/room/:roomId" component={Room} />
      <Route path="*" component={NoComponent} />
    </Router>
  ),
  root!
);
