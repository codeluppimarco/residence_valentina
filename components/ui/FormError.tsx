type FormErrorProps = {
  message?: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return <div className="-mt-1 mb-3 text-[13.5px] font-semibold text-danger">{message}</div>;
}
