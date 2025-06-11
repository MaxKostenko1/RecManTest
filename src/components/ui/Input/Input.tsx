import React from "react";
import styles from "./Input.module.css";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "search";
  size?: "small" | "medium" | "large";
}

const Input = ({
  variant = "default",
  size = "medium",
  className = "",
  ...props
}: InputProps) => {
  const inputClass =
    `${styles.input} ${styles[variant]} ${styles[size]} ${className}`.trim();

  return <input className={inputClass} {...props} />;
};

export default Input;
