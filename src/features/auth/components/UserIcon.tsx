import React from 'react';

type UserIconProps = {
  size?: number;
  className?: string;
};

export const UserIcon: React.FC<UserIconProps> = ({ size = 24, className = '' }) => {
  return (
    <div className={className} style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#999"
        width={size * 0.8}
        height={size * 0.8}
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
};
