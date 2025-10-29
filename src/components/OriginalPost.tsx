import React from 'react';
import CoffeeIcon from './icons/CoffeeIcon';

const OriginalPost: React.FC = () => {
    // Simple inline SVGs for tweet actions to avoid creating many small files
    const ReplyIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 4.90315C8.61662 4.90315 4.90315 8.24278 4.90315 12.3359C4.90315 14.4987 6.18163 16.3533 7.97541 17.5218L6.4455 20.3L9.75429 18.7909C10.8844 19.349 11.9686 19.6841 12 19.6841C15.3834 19.6841 19.0969 16.3445 19.0969 12.3359C19.0969 8.24278 15.3834 4.90315 12 4.90315Z" stroke="#708090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> </svg>);
    const RetweetIcon = () => (<svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.293.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.293.293.768.293 1.06 0s.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"></path></g></svg>);
  
    const LikeIcon = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    );
    const ShareIcon = () => (<svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.42V16h-2V6.42L7.71 9.71 6.3 8.29l5.7-5.7zM20 15v4c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-4H2v4c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-4h-2z"></path></g></svg>);

    return (
        <div className="flex space-x-3 p-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center">
                    <CoffeeIcon className="w-8 h-8 text-amber-100" />
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center space-x-1">
                    <span className="font-bold text-gray-900">The Coffee Shop</span>
                    <span className="text-gray-500">@coffee_shop</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500">1h</span>
                </div>
                <p className="mt-1 text-gray-800">
                    Happy Monday! ☀️ Start your week off right with one of our signature lattes. What are you sipping on today?
                </p>
                <div className="mt-3">
                    <img 
                        src="https://storage.googleapis.com/devfest-seattle/image.png" 
                        alt="An overhead view of a coffee spread including a latte, croissant, and cinnamon roll." 
                        className="w-full h-auto rounded-2xl border border-gray-200"
                    />
                </div>
                <div className="mt-3 flex justify-between text-gray-500 max-w-sm">
                    <button className="flex items-center space-x-2 hover:text-sky-500 transition-colors">
                        <ReplyIcon />
                        <span>12</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                        <RetweetIcon />
                        <span>45</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                        <LikeIcon />
                        <span>218</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-sky-500 transition-colors">
                        <ShareIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OriginalPost;
