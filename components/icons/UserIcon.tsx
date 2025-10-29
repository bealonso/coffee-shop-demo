import React from 'react';

interface IconProps {
    className?: string;
}

const UserIcon: React.FC<IconProps> = ({ className }) => (
    <img
        src="https://storage.googleapis.com/devfest-seattle/user_42.png"
        alt="Avatar for user_42"
        className={`${className} rounded-full object-cover`}
        aria-hidden="true"
    />
);

export default UserIcon;