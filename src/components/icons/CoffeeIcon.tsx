import React from 'react';

interface IconProps {
    className?: string;
}

const CoffeeIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 6.75C6.75 5.64543 7.64543 4.75 8.75 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V11.25C17.25 12.3546 16.3546 13.25 15.25 13.25H8.75C7.64543 13.25 6.75 12.3546 6.75 11.25V6.75Z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 9.5H19.25C20.3546 9.5 21.25 10.3954 21.25 11.5C21.25 12.6046 20.3546 13.5 19.25 13.5H17.25"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.75 16.75H19.25"
        />
    </svg>
);

export default CoffeeIcon;
