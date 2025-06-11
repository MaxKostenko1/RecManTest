import React from "react";
import styles from "./Text.module.css";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  variant?: "title" | "subtitle" | "body" | "caption";
  weight?: "normal" | "medium" | "semibold" | "bold";
  children: React.ReactNode;
}

const Text = ({
  as: Component = "p",
  variant = "body",
  weight = "normal",
  className = "",
  children,
  ...props
}: TextProps) => {
  const textClass =
    `${styles.text} ${styles[variant]} ${styles[weight]} ${className}`.trim();

  return (
    <Component className={textClass} {...props}>
      {children}
    </Component>
  );
};

export default Text;
