/**
 * @file com / form / button.tsx
 */

import { ReactNode } from "react";
import Styles from './button.module.css';

export type ButtonProps = {
  type?: 'button' | 'submit' | 'danger';
  disabled?: boolean;
  onClick?: () => Promise<void>;
  children: ReactNode;
};

const Button = (props: ButtonProps) => {
  return (
    <button 
      className={`
        ${Styles.button}
        ${props.type === 'button' && Styles.buttonPrimary}
        ${props.type === 'submit' && Styles.buttonSubmit}
        ${props.type === 'danger' && Styles.buttonDanger}
        ${props.disabled === true && Styles.buttonDisabled}
      `} 
      type={props?.type === 'submit' ? 'submit' : 'button'}
      onClick={props.onClick || (() => {})}
      disabled={props.disabled || false}
    >
      {props.children}
    </button>
  );
}

export default Button;
