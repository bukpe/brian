import { getIcon } from "../../services/IconService";
import styles from "./listItem.module.scss";

type ComponentProps = {
  hasButton?: boolean;
  icon?: string;
  isMobile: boolean;
  label: string;
  unitOfMeasurement?: string;
  value?: number | string;
  onButtonClick?: () => void;
};

export const ListItem = ({ hasButton, icon, isMobile, label, unitOfMeasurement, value, onButtonClick }: ComponentProps) => {
  return (
    <div className={styles.listItem}>
      <label>{label}</label>
      <div>
        {value && <p>{`${value}${unitOfMeasurement}`}</p>}
        {icon && <div className={styles.icon}>{getIcon(icon, isMobile ? 18 : 25)}</div>}
        {hasButton && <button onClick={onButtonClick}>{getIcon("search", isMobile ? 12 : 30)}</button>}
      </div>
    </div>
  );
};
