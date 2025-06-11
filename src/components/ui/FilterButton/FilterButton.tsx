import React from "react";
import styles from "./FilterButton.module.css";

interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

const FilterButton = ({
  active = false,
  className = "",
  children,
  ...props
}: FilterButtonProps) => {
  const buttonClass = `${styles.filterButton} ${
    active ? styles.active : ""
  } ${className}`.trim();

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default FilterButton;
