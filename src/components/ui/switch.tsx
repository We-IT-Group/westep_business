"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "../../utils/utils.ts";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-slate-700 inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent p-0.5 transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none size-6 rounded-full bg-white shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-slate-950",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
