/**
 * @file com / sign-in / index.tsx
 */

import { useState } from 'react';
import Form from "@com/form";
import { useStatus } from "hooks/use-status";
import Input from '@com/form/input';
import Button from '@com/form/button';
import { EmailRegex } from '@lib/regex';
import { signIn } from 'next-auth/react';

const SignInForm = () => {
  const status = useStatus();
  const [email, setEmail] = useState<string>('');
  const [emailValid, setEmailValid] = useState<boolean>(false);

  const onFormSubmit = async () => {
    status.setStatus("loading", "");

    try {
      const res = await signIn('email', { redirect: false, email });
      if (res.ok === false) {
        console.error(res.status, res.error);
        status.setStatus("error", {
          "form": `Sign-in Error: ${res.error}`
        });
      } else {
        status.setStatus("ok", {
          "form": "Check your email for the sign-in link!"
        });
        setEmail('');
        setEmailValid(false);
      }
    } catch (err) {
      console.error(err);
      status.setStatus("error", {
        "form": "Something went wrong. Try again later."
      });
    }
  }

  return (
    <>
      <Form 
        heading="Sign In" 
        instructions="Enter your email address below to sign in. If you do not have an account, you may use this form to register for one."
        statusState={status.state}
        statusMessage={status.messages['form']}
        onSubmit={onFormSubmit} 
      >
        <Input 
          id="email-input"
          label="Enter Your Email Address"
          text={email}
          onChange={(text) => setEmail(text)}
          onValidate={(valid) => setEmailValid(valid)}
          validator={EmailRegex}
          required={true}
          disabled={status.state === "loading"}
          error={status.messages['email-input']}
        />
        <Button
          type="submit"
          disabled={emailValid === false || status.state === "loading"}
        >Request Sign-In Link</Button>
      </Form>
    </>
  );
};

export default SignInForm;
