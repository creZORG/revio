import React from 'react';
const WidgetCard = ({ title, children }) => {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: 'white' }}>
      {title && <h3 style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>{title}</h3>}
      {children}
    </div>
  );
};
export default WidgetCard;