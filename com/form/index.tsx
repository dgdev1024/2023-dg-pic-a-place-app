/**
 * @file com / form / index.tsx
 */

import { FormEvent, ReactNode } from "react";
import { StatusState } from "@hooks/use-status";
import Styles from './index.module.css';

export type FormProps = {
  statusState: StatusState;
  statusMessage?: string;
  heading: string;
  instructions?: string;
  onSubmit: () => Promise<void>;
  children: ReactNode;
  formClassName?: string;
};

const Form = (props: FormProps) => {
  const internalOnSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    await props.onSubmit();
  };

  return (
    <form
      className={`
        ${Styles.form}
        ${props.statusState === 'loading' && Styles.formLoading}
        ${props.statusState === 'error' && Styles.formError}
        ${props.statusState === 'ok' && Styles.formOk}
      `}
      onSubmit={internalOnSubmit}
    >
      <div className={Styles.formHeadingContainer}>
        <div className={Styles.formHeadingSymbol}></div>
        <h2 className={Styles.formHeading}>{props.heading}</h2>
      </div>
      <div className={Styles.formMessageContainer}>
        {
          props.instructions && <p className={Styles.formInstructions}>{props.instructions}</p>
        }
        {
          props.statusMessage && <p className={Styles.formStatusMessage}>{props.statusMessage}</p>
        }
      </div>
      <div className={`
        ${Styles.formElementContainer}
        ${props?.formClassName || ''}
      `}>
        {props.children}
      </div>
    </form>
  )
};

export default Form;
