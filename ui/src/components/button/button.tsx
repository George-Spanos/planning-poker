
import { Component, JSXElement, mergeProps } from "solid-js";
import "./button.css";
export const Button: Component<{
  color?: string;
  text?: string;
  testId?: string;
  action?: () => void;
  disabled?: boolean;
  children?: JSXElement;
}> = (_props) => {
  const props = mergeProps(
    { color: "primary", disabled: false, testId: "" },
    _props
  );
  return (
    <button
      type="button"
      data-testid={props.testId}
      disabled={props.disabled}
      classList={{
        btn: true,
        primary: props.color === "primary",
        default: props.color === "default",
        disabled: props.disabled,
      }}
      onClick={props.action}
    >
      {props.children}
    </button>
  );
};
