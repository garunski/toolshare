"use client";

import {
  FormProvider,
  type FieldValues,
} from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from "./formField";
import {
  FormField,
  FormItem,
  useFormField,
} from "./formContext";

const Form = FormProvider;

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
