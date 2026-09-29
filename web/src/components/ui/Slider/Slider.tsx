import {Slider} from '@ark-ui/react/slider';
import {createRecipeContext} from '@/utils/createRecipeContext';
import {sliderRecipe} from './Slider.recipe';

const {withProvider, withContext} = createRecipeContext(sliderRecipe);

export const Root = withProvider(Slider.Root, 'root', {
	defaultProps: {
		min: 0,
		max: 100,
	},
});
export const Control = withContext(Slider.Control, 'control');
export const DraggingIndicator = withContext(Slider.DraggingIndicator, 'draggingIndicator');
export const HiddenInput = Slider.HiddenInput;
export const Label = withContext(Slider.Label, 'label');
export const Marker = withContext(Slider.Marker, 'marker');
export const MarkerGroup = withContext(Slider.MarkerGroup, 'markerGroup');
export const Range = withContext(Slider.Range, 'range');
export const Thumb = withContext(Slider.Thumb, 'thumb');
export const Track = withContext(Slider.Track, 'track');
export const ValueText = withContext(Slider.ValueText, 'valueText');
export const Context = Slider.Context;
