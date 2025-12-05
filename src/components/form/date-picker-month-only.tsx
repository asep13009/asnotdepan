import { useLayoutEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePickerMonthOnly({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) {
      console.warn(`Input element not found for flatpickr`);
      return;
    }

    console.log('Init flatpickr:', id);
    const flatPickr = flatpickr(inputElement, {
      mode: mode || "single",
      dateFormat: "M Y",
      defaultDate,
      onChange,
      plugins: [
        monthSelectPlugin({
          shorthand: true,
          dateFormat: "M Y",
          theme: "dark",
        }),
      ],
      static: false,
      appendTo: document.body,
      disableMobile: true,
    } as any);

    return () => {
      console.log('Destroy flatpickr:', id);
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative w-full">
        <input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 bg-gray-800 text-white border-gray-700 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 "
          readOnly
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
    
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
