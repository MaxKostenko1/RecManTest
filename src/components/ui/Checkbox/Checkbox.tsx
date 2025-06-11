import React from "react";
import styles from "./Checkbox.module.css";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "task" | "select";
}

const Checkbox = ({
  variant = "default",
  className = "",
  ...props
}: CheckboxProps) => {
  const checkboxClass =
    `${styles.checkbox} ${styles[variant]} ${className}`.trim();

  return <input type="checkbox" className={checkboxClass} {...props} />;
};

export default Checkbox;
