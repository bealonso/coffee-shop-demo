import React from 'react';

interface IconProps {
    className?: string;
}

const GeminiIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <path d="M12 0 C12 0 10 10 0 12 C0 12 10 14 12 24 C12 24 14 14 24 12 C24 12 14 10 12 0 Z" />
    </svg>
);

export default GeminiIcon;