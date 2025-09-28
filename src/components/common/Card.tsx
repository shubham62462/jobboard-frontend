import { ReactNode, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div 
      className={clsx(
        'rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm p-6', 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;