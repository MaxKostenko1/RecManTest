import React from "react";
import styles from "./IconButton.module.css";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "save" | "cancel" | "delete" | "neutral";
  size?: "small" | "medium";
  icon: string;
  children?: React.ReactNode;
}

const IconButton = ({
  variant = "neutral",
  size = "small",
  icon,
  className = "",
  children,
  ...props
}: IconButtonProps) => {
  const buttonClass =
    `${styles.iconButton} ${styles[variant]} ${styles[size]} ${className}`.trim();

  return (
    <button className={buttonClass} {...props}>
      {icon}
      {children}
    </button>
  );
};

export default IconButton;
