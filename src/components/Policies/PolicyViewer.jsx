import React from 'react';
const PolicyViewer = ({ policyContent, title = "Policy" }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', lineHeight: '1.8' }}>
      <h1>{title}</h1>
      {policyContent ? (
        <div dangerouslySetInnerHTML={{ __html: policyContent }} />
      ) : (
        <>
          <p>This is a placeholder for policy content.</p>
          <p>Detailed legal text will be loaded here from your backend or static files.</p>
        </>
      )}
    </div>
  );
};
export default PolicyViewer;