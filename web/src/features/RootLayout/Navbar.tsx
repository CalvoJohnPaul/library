import {Avatar} from '@/components/ui/Avatar';

export function Navbar() {
	return (
		<header className="flex h-16 items-center border-gray-200 border-b px-8">
			<div className="grow"></div>
			<Avatar.Root>
				<Avatar.Fallback />
			</Avatar.Root>
		</header>
	);
}
