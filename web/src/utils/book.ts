import {type BookGenre, BookGenreDefinition} from '@library/types';
import type {Option} from '../types';

const map: Record<BookGenre, string> = {
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
		label: map[value],
	}));
}

export function getBookGenreLabel(genre: BookGenre): string {
	return map[genre];
}
