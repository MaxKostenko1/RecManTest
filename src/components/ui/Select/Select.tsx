import React from "react";
import styles from "./Select.module.css";

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

const Select = ({
  size = "medium",
  className = "",
  children,
  disabled = false,
  ...props
}: SelectProps) => {
  const selectClass = `${styles.select} ${styles[size]} ${className}`.trim();

  return (
    <select className={selectClass} disabled={disabled} {...props}>
      {children}
    </select>
  );
};

export default Select;
