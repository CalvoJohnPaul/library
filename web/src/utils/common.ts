import {
	type BookCopyStatus,
	BookCopyStatusDefinition,
	type BookGenre,
	BookGenreDefinition,
} from '@library/types';
import type {Option} from '../types';

const BOOK_GENRE_MAP: Record<BookGenre, string> = {
	FICTION: 'Fiction',
	NON_FICTION: 'Non-Fiction',
	ROMANCE: 'Romance',
	FANTASY: 'Fantasy',
	SCIENCE_FICTION: 'Science Fiction',
	MYSTERY: 'Mystery',
	THRILLER: 'Thriller',
	HORROR: 'Horror',
	HISTORICAL_FICTION: 'Historical Fiction',
	BIOGRAPHY: 'Biography',
	SELF_HELP: 'Self-Help',
	HISTORY: 'History',
	PHILOSOPHY: 'Philosophy',
	PSYCHOLOGY: 'Psychology',
	BUSINESS: 'Business',
	SCIENCE: 'Science',
	TRAVEL: 'Travel',
	RELIGION_SPIRITUALITY: 'Religion & Spirituality',
	YOUNG_ADULT: 'Young Adult',
	CHILDREN: "Children's",
	POETRY: 'Poetry',
};

export function getBookGenreOptions(): Option[] {
	return BookGenreDefinition.options.map((value) => ({
		value,
		label: BOOK_GENRE_MAP[value],
	}));
}

export function getBookGenreLabel(genre: BookGenre): string {
	return BOOK_GENRE_MAP[genre];
}

export function getBookYearPublishedOptions(): Option[] {
	const startYear = 1960;
	const endYear = new Date().getFullYear();

	return Array.from({length: endYear - startYear + 1}, (_, i) => {
		const n = `${startYear + i}`;

		return {
			value: n,
			label: n,
		};
	}).toReversed();
}

const BOOK_COPY_STATUS_MAP: Record<BookCopyStatus, string> = {
	AVAILABLE: 'Available',
	BORROWED: 'Borrowed',
};

export function getBookCopyStatusOptions(): Option[] {
	return BookCopyStatusDefinition.options.map((value) => ({
		value,
		label: BOOK_COPY_STATUS_MAP[value],
	}));
}

export function getBookCopyStatusLabel(status: BookCopyStatus): string {
	return BOOK_COPY_STATUS_MAP[status];
}
