import {useEffect, useState} from 'react';

export type NetworkState = 'ONLINE' | 'ONLINE_BUT_SLOW' | 'OFFLINE';

/**
 * URL used to verify Internet connectivity.
 */
const PING_URL = 'https://www.google.com/generate_204';

/**
 * Frequency of network checks.
 */
const CHECK_INTERVAL_MS = 5_000;

/**
 * Maximum time to wait for a response before considering the network offline.
 */
const REQUEST_TIMEOUT_MS = 3_000;

/**
 * Network latency above which the connection is considered slow.
 */
const SLOW_THRESHOLD_MS = 500;

/**
 * Number of consecutive slow latency readings required before reporting
 * ONLINE_BUT_SLOW. This prevents temporary latency spikes from causing
 * the network state to fluctuate.
 */
const CONSECUTIVE_SLOW_READINGS = 2;

export function useNetworkState(initialState?: NetworkState): NetworkState {
	const [state, setState] = useState<NetworkState>(initialState ?? 'ONLINE');

	useEffect(() => {
		let disposed = false;
		let slowReadings = 0;

		async function check() {
			if (!navigator.onLine) {
				slowReadings = 0;
				setState('OFFLINE');
				return;
			}

			const controller = new AbortController();
			const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
			const start = performance.now();

			try {
				await fetch(PING_URL, {
					method: 'HEAD',
					mode: 'no-cors',
					cache: 'no-store',
					signal: controller.signal,
				});

				const latency = performance.now() - start;

				if (disposed) {
					return;
				}

				if (latency > SLOW_THRESHOLD_MS) {
					slowReadings++;

					if (slowReadings >= CONSECUTIVE_SLOW_READINGS) {
						setState('ONLINE_BUT_SLOW');
					}
				} else {
					slowReadings = 0;
					setState('ONLINE');
				}
			} catch {
				slowReadings = 0;

				if (!disposed) {
					setState('OFFLINE');
				}
			} finally {
				clearTimeout(timeout);
			}
		}

		check();

		const interval = window.setInterval(check, CHECK_INTERVAL_MS);

		window.addEventListener('online', check);
		window.addEventListener('offline', check);

		return () => {
			disposed = true;
			window.clearInterval(interval);
			window.removeEventListener('online', check);
			window.removeEventListener('offline', check);
		};
	}, []);

	return state;
}
