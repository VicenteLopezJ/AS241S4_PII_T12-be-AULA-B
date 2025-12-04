
const Button = ({ children, onClick, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold rounded-md transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;