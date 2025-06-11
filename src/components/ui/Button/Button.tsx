import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

const Button = ({
  variant = "secondary",
  size = "medium",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const buttonClass =
    `${styles.button} ${styles[variant]} ${styles[size]} ${className}`.trim();

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
