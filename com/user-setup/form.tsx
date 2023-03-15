/**
 * @file com / user-setup / form.tsx
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Form from "@com/form";
import Input from "@com/form/input";
import Button from "@com/form/button";
import { Session } from 'next-auth';
import { useStatus } from '@hooks/use-status';
import { LettersAndSpacesOnly } from '@lib/regex';
import { UserSetupResponse } from '@pages/api/user/setup';
import { useRouter } from 'next/router';

export type UserSetupFormProps = {
  session: Session
};

const UserSetupForm = (props: UserSetupFormProps) => {
  const router = useRouter();
  const status = useStatus();
  const [nameInput, setNameInput] = useState<string>(props.session.user.name || '');
  const [nameInputValid, setNameInputValid] = useState<boolean>(
    LettersAndSpacesOnly.test(props.session.user.name || '')
  );
  const [changeApiKey, setChangeApiKey] = useState<boolean>(false);

  const onFormSubmit = async () => {
    status.setStatus('loading', '');

    try {
      const res = await fetch('/api/user/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, changeKey: changeApiKey })
      })
      if (res.ok === false) {
        status.setStatus('error', { 'form': `${res.status}: ${res.statusText}` });
        return;
      }

      const data = await res.json() as UserSetupResponse;
      if (data.error) {
        status.setStatus('error', { 'form': data.error });
        return;
      }

      router.push('/');
    } catch (err) {
      console.error(err);
      status.setStatus("error", { "form": err.message || "Something went wrong. Try again later." })
    }
  };

  return (
    <Form 
      heading="User Setup"
      instructions="Use the form below to set up some details for your account."
      statusState={status.state}
      statusMessage={status.messages['form']}
      onSubmit={onFormSubmit}
    >
      <Input
        id="name-input"
        label="Enter Your Name"
        text={nameInput}
        onChange={(text) => setNameInput(text)}
        onValidate={(valid) => setNameInputValid(valid)}
        validator={LettersAndSpacesOnly}
        disabled={
          status.state === 'loading'
        }
        required={true}
        error={status.messages['name-input']}
      />
      <Button
        type="button"
        disabled={
          status.state === 'loading'
        }
        onClick={async () => setChangeApiKey(change => !change)}
      >
        {
          changeApiKey === true ?
            "Keep API Key" :
            "Change API Key"
        }
      </Button>
      <Button
        type="submit"
        disabled={
          status.state === 'loading' ||
          nameInput === '' ||
          nameInputValid === false
        }
      >Save Details</Button>
    </Form>
  );
};

export default UserSetupForm;
