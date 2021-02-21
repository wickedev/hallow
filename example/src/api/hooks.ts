import { useRef, useState } from "react";
import { greetingStub } from "./greeting-stub";

export function useForceUpdate(): () => void {
  const setValue = useState(0)[1];
  return useRef(() => setValue((v) => ~v)).current;
}

export const hooks = greetingStub.createHooks();
