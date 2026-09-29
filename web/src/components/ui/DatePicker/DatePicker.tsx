import {DatePicker} from '@ark-ui/react/date-picker';
import {CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon} from 'lucide-react';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {datePickerRecipe} from './DatePicker.recipe';

const {withProvider, withContext} = createRecipeContext(datePickerRecipe);

export const Root = withProvider(DatePicker.Root, 'root', {
	defaultProps: {
		lazyMount: true,
		fixedWeeks: true,
		positioning: {
			placement: 'bottom-start',
		},
	},
});
export const ClearTrigger = withContext(DatePicker.ClearTrigger, 'clearTrigger', {
	defaultProps: {
		children: <XIcon />,
	},
});
export const Input = withContext(DatePicker.Input, 'input');
export const Trigger = withContext(DatePicker.Trigger, 'trigger', {
	defaultProps: {
		children: <CalendarIcon />,
	},
});
export const MonthSelect = withContext(DatePicker.MonthSelect, 'monthSelect');
export const PresetTrigger = withContext(DatePicker.PresetTrigger, 'presetTrigger');
export const ViewTrigger = withContext(DatePicker.ViewTrigger, 'viewTrigger');
export const YearSelect = withContext(DatePicker.YearSelect, 'yearSelect');
export const Table = withContext(DatePicker.Table, 'table');
export const TableBody = withContext(DatePicker.TableBody, 'tableBody');
export const TableCell = withContext(DatePicker.TableCell, 'tableCell');
export const TableCellTrigger = withContext(DatePicker.TableCellTrigger, 'tableCellTrigger');
export const TableHead = withContext(DatePicker.TableHead, 'tableHead');
export const TableHeader = withContext(DatePicker.TableHeader, 'tableHeader');
export const TableRow = withContext(DatePicker.TableRow, 'tableRow');
export const Positioner = withContext(DatePicker.Positioner, 'positioner');
export const View = withContext(DatePicker.View, 'view');
export const ViewControl = withContext(DatePicker.ViewControl, 'viewControl');
export const Content = withContext(DatePicker.Content, 'content');
export const Control = withContext(DatePicker.Control, 'control');
export const PrevTrigger = withContext(DatePicker.PrevTrigger, 'prevTrigger', {
	defaultProps: {
		children: <ChevronLeftIcon />,
	},
});
export const NextTrigger = withContext(DatePicker.NextTrigger, 'nextTrigger', {
	defaultProps: {
		children: <ChevronRightIcon />,
	},
});
export const Label = withContext(DatePicker.Label, 'label');
export const RangeText = withContext(DatePicker.RangeText, 'rangeText');
export const Context = DatePicker.Context;
