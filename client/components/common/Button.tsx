"use client";

import styles from "./Button.module.scss";

interface ButtonProps {
  text: string | React.ReactNode;
  onClick?: () => void;
  textColor?: "dark" | "white";
  hoverColor?: "primary" | "teal";
  className?: string;
  disableHover?: boolean;
  disabled?: boolean;
}

export default function Button({
  text,
  onClick,
  textColor = "dark",
  hoverColor = "primary",
  className = "",
  disableHover = false,
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[textColor]} ${disableHover ? '' : styles[hoverColor]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{text}</span>
      <img
        src="/images/arrow-down.svg"
        alt="arrow"
        className={styles.arrow}
      />
    </button>
  );
}