/**
 * @file com / layout / header.tsx
 */

import { ReactNode } from "react";
import Styles from './header.module.css';

export type HeaderProps = {
  children?: ReactNode;
  navShown: boolean;
  onNavButtonClicked: () => void;
};

const Header = (props: HeaderProps) => {
  return (
    <header className={Styles.header}>
      <div className={Styles.headerContainer}>
        <h1 className={Styles.headerBrand}>
          Pic-A-Place
        </h1>
        <button 
          className={`
            ${Styles.headerNavToggle}
            ${props.navShown && Styles.headerNavToggleShown}
          `} 
          onClick={props.onNavButtonClicked}
          aria-label="Click to show or hide the navigation menu."
          title="Click to show or hide the navigation menu."
        >

        </button>
      </div>
    </header>
  );
};

export default Header;
