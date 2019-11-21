import React from 'react';

const OuterContainerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: '2rem',
};
const InnerContainerStyles: React.CSSProperties = {
  width: '100%',
  maxWidth: 1000,
};

type Props = {
  children: React.ReactNode;
};

export const StoryContainer: React.FC<Props> = ({ children }: Props) => {
  return (
    <div style={OuterContainerStyles}>
      <div style={InnerContainerStyles}>{children}</div>
    </div>
  );
};
