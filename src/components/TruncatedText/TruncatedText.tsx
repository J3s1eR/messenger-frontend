import { useState } from "react";
import styles from "./TruncatedText.module.css";

type TruncatedTextProps = {
  text: string;
  maxLength: number;
  className?: string;
  AlwaysTrancated?: boolean;
};

const TruncatedText = ({ text, maxLength, className = "", AlwaysTrancated = false }: TruncatedTextProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const truncatedText =
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <span
      className={`${className} ${isHovered ? styles.fullText : styles.truncatedText} `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={text} // Показывает полный текст при наведении
    >
      {isHovered ? AlwaysTrancated ? truncatedText : text : truncatedText}
    </span>
  );
};

export default TruncatedText;