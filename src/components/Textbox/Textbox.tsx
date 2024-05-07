import styles from "./textbox.module.scss";

type TextboxType = {
  placeholder: string;
  value: string;
  onChange(value: string): void;
};

export const Textbox = ({ placeholder, value, onChange }: TextboxType) => {
  return <input type="text" className={styles.searchBox} placeholder={placeholder} onChange={e => onChange(e.target.value)} value={value || ""} />;
};
