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
export const input_box =
	'dark:bg-gray-700 text-white rounded px-3 py-2 mb-2 sm:mb-0 invalid:border-pink-500 invalid:text-pink-600 focus:border-sky-500 focus:outline focus:outline-sky-500 focus:invalid:border-pink-500 focus:invalid:outline-pink-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none dark:disabled:border-gray-700 dark:disabled:bg-gray-800/20';
