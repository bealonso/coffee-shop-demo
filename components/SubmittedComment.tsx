
import React from 'react';
import UserIcon from './icons/UserIcon';

interface SubmittedCommentProps {
  comment: string;
}

const SubmittedComment: React.FC<SubmittedCommentProps> = ({ comment }) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex space-x-3">
        <div className="flex-shrink-0 relative">
          {/* This creates the vertical line connecting threads */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 h-full w-0.5 bg-gray-300"></div>
          <UserIcon className="w-12 h-12 relative" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900">user_42</span>
            <span className="text-gray-500">@user_42</span>
          </div>
          <p className="mt-1 text-gray-800 whitespace-pre-wrap">{comment}</p>
        </div>
      </div>
    </div>
  );
};

export default SubmittedComment;