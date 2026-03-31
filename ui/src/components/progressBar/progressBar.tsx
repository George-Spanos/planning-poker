import { Component, createSignal, onCleanup } from "solid-js";
import "./progressBar.css";

export const ProgressBar: Component<{ duration: number }> = (props) => {
  const [width, setWidth] = createSignal(100);
  const intervalTime = 20;

  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const newWidth = Math.max(100 - (elapsed / props.duration) * 100, 0);

    setWidth(newWidth);

    if (newWidth <= 0) {
      clearInterval(interval);
    }
  }, intervalTime);

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div id="progress-bar">
      <div id="bar" style={{ width: width() + "%" }}></div>
    </div>
  );
};
