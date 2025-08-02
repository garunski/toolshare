"use client";

import { FormProvider } from "react-hook-form";

import { FormField, FormItem, useFormField } from "./formContext";
import {
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from "./formField";

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
