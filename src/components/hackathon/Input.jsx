const Input = ({ value, onChange, type = 'text', placeholder, className, ...props }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border p-2 rounded-md w-full ${className}`}
      {...props}
    />
  );
};

export default Input;