import {
  useField,
  ValidatedForm,
  useIsSubmitting,
  validationError,
} from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { ActionFunction } from "remix";
import { isEmailBurner } from "burner-email-providers";

const ClientSchema = z.object({
  email: z.string().email(),
});

const ClientEmailValidator = withZod(ClientSchema);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  //   This is the code that causes the error. isEmailBurner is being called in the client and it's not bundled and this crashes the server.
  const serverValidator = withZod(
    ClientSchema.refine((data) => !isEmailBurner(data.email), {
      message: "Sorry, we don't support this email provider.",
      path: ["email"],
    })
  );
  //   End of the code that causes the error.

  const result = await serverValidator.validate(formData);
  if (result.error) {
    return validationError(result.error, result.submittedData);
  }
};
export default function Login() {
  return (
    <ValidatedForm method="post" validator={ClientEmailValidator}>
      <FormTextInput
        type="email"
        label="email"
        name="email"
        placeholder="yourname@email.com"
      />

      <FormSubmitButton />
    </ValidatedForm>
  );
}

type InputProps = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
};

export const FormTextInput = ({
  name,
  label,
  placeholder = "",
  type = "text",
}: InputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        {...getInputProps({ id: name })}
        placeholder={placeholder}
        type={type}
      />
      {error && <span>{error}</span>}
    </div>
  );
};

type ButtonProps = {
  className?: string;
};

export const FormSubmitButton = ({ className = "" }: ButtonProps) => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting} className={className}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};
