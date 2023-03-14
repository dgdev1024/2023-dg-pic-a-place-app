/**
 * @file hooks / use-status.ts
 */

import { useState } from "react";

export type StatusState = "idle" | "loading" | "ok" | "error";
export type StatusMessages = { [key: string]: string };

export const useStatus = () => {
  const [statusState, setStatusState] = useState<StatusState>("idle");
  const [statusMessages, setStatusMessages] = useState<StatusMessages>({});

  const setStatus = (state: StatusState, messages: StatusMessages | string) => {
    setStatusState(state);

    if (typeof messages === 'string') {
      setStatusMessages({ "default": messages });
    } else {
      setStatusMessages(messages);
    }
  }

  return {
    state: statusState,
    messages: statusMessages,
    message: statusMessages["default"],
    setStatus
  }
};
