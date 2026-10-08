// TODO: Replace with real data from a future /stats endpoint.

export interface Stat {
	label: string;
	value: string;
	icon: 'books' | 'copies' | 'members' | 'borrows';
	sub: string;
}

export interface ActivityPoint {
	date: string;
	borrowed: number;
	returned: number;
}

export interface GenrePoint {
	genre: string;
	count: number;
}

export interface TopBook {
	title: string;
	count: number;
}

export const stats: Stat[] = [
	{
		label: 'Total books',
		value: '1,248',
		icon: 'books',
		sub: '3,512 copies across all titles',
	},
	{
		label: 'Copies available',
		value: '3,112',
		icon: 'copies',
		sub: '400 copies currently borrowed',
	},
	{
		label: 'Members',
		value: '862',
		icon: 'members',
		sub: '58 joined this month',
	},
	{
		label: 'Outstanding borrows',
		value: '37',
		icon: 'borrows',
		sub: '12 pending for over 14 days',
	},
];

export const activity: ActivityPoint[] = [
	{date: 'Sep 25', borrowed: 18, returned: 12},
	{date: 'Sep 26', borrowed: 25, returned: 19},
	{date: 'Sep 27', borrowed: 31, returned: 24},
	{date: 'Sep 28', borrowed: 12, returned: 9},
	{date: 'Sep 29', borrowed: 8, returned: 6},
	{date: 'Sep 30', borrowed: 27, returned: 31},
	{date: 'Oct 01', borrowed: 34, returned: 26},
	{date: 'Oct 02', borrowed: 29, returned: 33},
	{date: 'Oct 03', borrowed: 41, returned: 28},
	{date: 'Oct 04', borrowed: 22, returned: 17},
	{date: 'Oct 05', borrowed: 15, returned: 11},
	{date: 'Oct 06', borrowed: 38, returned: 25},
	{date: 'Oct 07', borrowed: 44, returned: 36},
	{date: 'Oct 08', borrowed: 31, returned: 27},
];

export const genres: GenrePoint[] = [
	{genre: 'Fiction', count: 412},
	{genre: 'Science', count: 268},
	{genre: 'History', count: 197},
	{genre: 'Fantasy', count: 154},
	{genre: 'Biography', count: 121},
	{genre: 'Poetry', count: 86},
	{genre: 'Others', count: 110},
];

export const topBooks: TopBook[] = [
	{title: 'The Hobbit', count: 48},
	{title: '1984', count: 41},
	{title: 'To Kill a Mockingbird', count: 35},
	{title: 'The Great Gatsby', count: 28},
	{title: 'Brave New World', count: 22},
];
