import clsx from 'clsx';
import Image from 'next/image';

type MessageBubbleProps = {
	name?: string;
	time?: string;
	text?: string;
	image?: string;
	delivered?: boolean;
	sent?: boolean; // true → right side (blue bubble), false → left side (gray bubble)
};

export default function MessageBubble({
	name,
	time,
	text,
	image,
	delivered = true,
	sent = false,
}: MessageBubbleProps) {
	return (
		<div
			className={clsx(
				'flex items-start gap-2.5',
				sent ? 'justify-end !items-end' : 'justify-start'
			)}
		>
			{!sent && image && (
				<Image
					className="w-8 h-8 rounded-full object-cover"
					alt={`${name} profile`}
					src={image}
					width={32}
					height={32}
				/>
			)}

			<div
				className={clsx(
					'flex flex-col w-fit max-w-xs sm:max-w-md leading-1.5 p-4 rounded-2xl shadow-md',
					sent
						? 'bg-blue-500 text-white rounded-br-sm'
						: 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white rounded-tl-sm'
				)}
			>
				<div className="flex items-center space-x-2 rtl:space-x-reverse">
					<span
						className={clsx(
							'text-sm font-semibold',
							sent ? 'text-white' : 'text-gray-900 dark:text-white'
						)}
					>
						{name}
					</span>
					<span
						className={clsx(
							'text-sm font-normal',
							sent ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
						)}
					>
						{time}
					</span>
				</div>

				<p className="text-sm font-normal py-2.5">{text}</p>

				{delivered && sent && (
					<span className="text-xs font-normal text-blue-100">Delivered</span>
				)}
			</div>

			{sent && image && (
				<Image
					className="w-8 h-8 rounded-full object-cover"
					alt={`${name} profile`}
					src={image}
					width={32}
					height={32}
				/>
			)}
		</div>
	);
}
