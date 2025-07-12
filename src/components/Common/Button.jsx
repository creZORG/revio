import React from 'react';
const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  return (
    <button type={type} onClick={onClick} className={`common-button ${className}`} {...props}>
      {children}
    </button>
  );
};
export default Button;