import clsx from 'clsx';

export const cardstyle =
	'dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-t-4 dark:border-gray-700';
export const normal_pill = 'dark:bg-gray-800 rounded-xl p-6 shadow-2xl mb-8';
export const title = 'text-2xl font-semibold text-orange-300 my-2';
export const title_changeable = clsx(title, 'cursor-pointer hover:underline');
export const title_subtle = 'text-lg font-semibold text-gray-400';
export const button =
	'flex shrink cursor-pointer space-x-2 font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-105 active:scale-95';
export const delete_button = clsx(
	button,
	'bg-red-600 hover:bg-red-700 text-white'
);
