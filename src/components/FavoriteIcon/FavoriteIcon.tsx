import { getIcon } from "../../services/IconService";
import styles from "./favoriteIcon.module.scss";

type ComponentProps = {
  isCurrentLocationFavorite: boolean;
  isMobile?: boolean;
  onClickFavoriteIcon(): void;
};

export const FavoriteIcon = ({ isCurrentLocationFavorite, isMobile, onClickFavoriteIcon }: ComponentProps) => {
  return (
    <div className={styles.favoriteIcon} onClick={onClickFavoriteIcon}>
      {getIcon(isCurrentLocationFavorite ? "star" : "star-empty", isMobile ? 20 : 40)}
    </div>
  );
};
