import React, { ReactNode } from 'react';

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
	className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
	content,
	children,
	className = '',
}) => (
	<span className={`relative group ${className}`}>
		{children}
		<span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-10">
			{content}
		</span>
	</span>
);

export default Tooltip;
