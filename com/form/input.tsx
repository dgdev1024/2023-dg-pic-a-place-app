/**
 * @file com / form / input.tsx
 */

import { ChangeEvent, useEffect, useState } from 'react';
import Styles from './input.module.css';

export type InputProps = {
  id: string;
  label: string;
  text: string;
  onChange?: (text: string) => void;
  onValidate?: (valid: boolean) => void;
  validator?: RegExp;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

const Input = (props: InputProps) => {
  const [valid, setValid] = useState<boolean>(false);

  const onTextChange = (ev: ChangeEvent<HTMLInputElement>) => {
    let isTextValid = true;
    const text = ev.target.value;

    if (props.required && props.required === true && text === '') {
      isTextValid = false;
    }

    if (props.validator && props.validator.test(text) === false) {
      isTextValid = false;
    }

    setValid(isTextValid);
    props.onValidate?.(isTextValid);
    props.onChange?.(text);
  };

  return (
    <div className={`
      ${Styles.inputContainer}
      ${(valid === false || props.error) && Styles.inputContainerError}
    `}>
      <input
        className={Styles.input}
        type="text"
        id={props.id}
        name={props.id}
        value={props.text}
        onChange={onTextChange}
        disabled={props.disabled || false}
        required={props.required || false}
      />
      <label
        className={`
          ${Styles.inputLabel}
        `}
        htmlFor={props.id}
      >{props.label}</label>
      {
        props.error && <p className={Styles.inputError}>{props.error}</p>
      }
    </div>
  );
};

export default Input;
