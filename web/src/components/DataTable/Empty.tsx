import {BrushCleaningIcon} from 'lucide-react';
import {useId} from 'react';
import {FeaturedIcon} from '../ui/FeaturedIcon';
import {useDataTableContext} from './DataTableContext';
import {FiltersTrigger} from './Filters';
import {ReloadTrigger} from './ReloadTrigger';

export function Empty() {
	const {cta} = useDataTableContext();
	const id = useId();
	const titleId = `empty:${id}:title`;
	const descriptionId = `empty:${id}:description`;

	return (
		<div
			role="alert"
			aria-live="polite"
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			className="flex grow flex-col items-center px-16 py-24"
		>
			<FeaturedIcon.Root accent="warning" className="mx-auto">
				<FeaturedIcon.Icon>
					<BrushCleaningIcon />
				</FeaturedIcon.Icon>
			</FeaturedIcon.Root>

			<div id={titleId} className="mt-5 font-semibold text-lg">
				No results found
			</div>
			<div id={descriptionId} className="text-neutral-300">
				There are no items that match your current search or filters.
			</div>
			<div className="mt-5 flex gap-3">
				{cta}
				<FiltersTrigger />
				<ReloadTrigger />
			</div>
		</div>
	);
}
