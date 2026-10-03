import { Fragment, type ReactNode } from "react";

/**
 * Like fmt(), for values that are elements: "Call {phone}" with the number in
 * a <bdi>, so every language can put it where its grammar wants it.
 */
export function rich(template: string, values: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={i}>{key && key in values ? values[key] : part}</Fragment>;
  });
}
