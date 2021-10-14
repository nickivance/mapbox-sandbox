import React from 'react';
import {render} from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import mapboxgl from '!mapbox-gl';

import { useRef, useEffect, useState } from 'react';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// create a function to make a directions request
async function getRoute(map, start, end) {
	// make a directions request using cycling profile
	// an arbitrary start will always be the same
	// only the end or destination will change
	console.log(`https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`);
	try {
		const query = await fetch(
			`https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
			{ method: 'GET' }
		);
		const json = await query.json();
		const data = json.routes[0];
		const route = data.geometry.coordinates;
		const geojson = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates: route
			}
		};
		// if the route already exists on the map, we'll reset it using setData
		if (map.getSource('route')) {
			map.getSource('route').setData(geojson);
		}
		// otherwise, we'll make a new request
		else {
			map.addLayer({
				id: 'route',
				type: 'line',
				source: {
					type: 'geojson',
					data: geojson
				},
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': '#3887be',
					'line-width': 5,
					'line-opacity': 0.75
				}
			});
		}
	} catch(err) {
		console.log(err.message);
	}
}

const Map = ({containerRef, isTop, map, opacity, startCoords, end}) => {
	const [lat, setLat] = useState(startCoords.lat);
	const [lng, setLng] = useState(startCoords.lng);
	const [zoom, setZoom] = useState(14);

	useEffect(() => {
		if (map.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: containerRef.current,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [lng, lat],
			zoom: zoom
		});
		console.log(map);
		map.current.on('load', () => {
			// make an initial directions request that
			// starts and ends at the same location
			getRoute(map, [lng, lat], [end.lng, end.lat]);

		});
	});

	useEffect(() => {
		if (!map.current) return; // wait for map to initialize
		map.current.on('move', () => {
			setLng(map.current.getCenter().lng.toFixed(4));
			setLat(map.current.getCenter().lat.toFixed(4));
			setZoom(map.current.getZoom().toFixed(2));
		});
	});

	return (
		<>
			{/*<div>{`Latitude: ${lat}, Longitude: ${lng}, Zoom: ${zoom}`}</div>*/}
			<div
				ref={containerRef}
				className={`map-container ${isTop ? 'top' : ''}`}
				style={{opacity: `${opacity}%`}}
			/>
		</>
	);
};

const OpacityRange = ({value, onChange}) => {
	return (
		<label>
			<input type='range' onChange={onChange} step={5} value={value}/>
			<span>{value}%</span>
		</label>
	);
};

const TopRadio = ({map, onChange}) => {
	return (
		<input checked={map} onChange={onChange} type='radio'/>
	);
};

const App = () => {
	const mapContainerOne = useRef(null);
	const mapContainerTwo = useRef(null);
	const mapOneRef = useRef(null);
	const mapTwoRef = useRef(null);
	// const [shiftPressed, setShiftPressed] = useState(false);
	const [mapOneIsTop, setMapOneIsTop] = useState(true);
	const [mapOneOpacity, setOneOpacity] = useState(100);
	const [mapTwoOpacity, setTwoOpacity] = useState(100);
	const [overlayMaps, setOverlayMaps] = useState(false);
	const startCoordinatesOne = {lng: -122.66018766144089, lat: 45.53569721887533};
	const startCoordinatesTwo = {lng: 144.99433483493962, lat: -37.80131284816989};
	const routeOne = {
		start: {lng: -122.66018766144089, lat: 45.53569721887533},
		end: {lng: -122.6393532809991, lat:45.534889398275084},
	};
	const routeTwo = {
		start: {lng: 144.99408459362985, lat: -37.801012846814096},
		end: {lng: 144.99834315169755, lat: -37.81027946175521},
	};
	// const zoom = 12;
	// const [zoom, setZoom] = useState(9);

	// const toggleTop = () => {
	// 	console.log('toggle: ', shiftPressed);
	// 	if (shiftPressed) {
	// 		setShiftPressed(false);
	// 	} else {
	// 		setShiftPressed(true);
	// 	}
	// };
	// const handleKeyDown = (e) => {
	// 	console.log('down:', e.shiftKey, mapOneIsTop, e.key);
	// 	if (e.shiftKey) {
	// 		toggleTop();
	// 		// setMapOneIsTop(!mapOneIsTop);
	// 		// setTopOne();
	// 	}
	// };
	// const handleKeyUp = (e) => {
	// 	if (!e.shiftKey) {
	// 		console.log('up: ', e.shiftKey, mapOneIsTop, e.key);
	// 		toggleTop();
	// 		// setMapOneIsTop(!mapOneIsTop);
	// 		// setTopTwo();
	// 	}
	// };
	// useEffect(() => console.log('top map has changed', mapOneIsTop), [mapOneIsTop]);
	// useEffect(() => setMapOneIsTop(!mapOneIsTop), [shiftPressed]);
	// useEffect(() => {
	// 	window.addEventListener('keydown', handleKeyDown);
	// 	window.addEventListener('keyup', handleKeyUp);
	// 	return () => {
	// 		window.removeEventListener('keydown', handleKeyDown);
	// 		window.removeEventListener('keyup', handleKeyUp);
	// 	};
	// }, []);

	const setTopOne = () => setMapOneIsTop(true);
	const setTopTwo = () => setMapOneIsTop(false);
	const handleRangeOne = (e) => setOneOpacity(e.target.value);
	const handleRangeTwo = (e) => setTwoOpacity(e.target.value);
	const toggleOverlayMode = () => setOverlayMaps(s => !s);

	return (
		<div>
			<h2>Map x Map</h2>
			<button className={overlayMaps ? 'Off' : 'On'} onClick={toggleOverlayMode}>{overlayMaps ? 'Show Side-by-Side' : 'Overlay Maps'}</button>
			{/*todo: call a resize on canvas when maps are overlaid so they fill the full width*/}
			{overlayMaps ? (
				<table>
					<thead>
						<tr>
							<th>Top</th>
							<th>Map</th>
							<th>Opacity</th>
							<th>Center</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><TopRadio map={mapOneIsTop} onChange={setTopOne}/></td>
							<td>PDX</td>
							<td><OpacityRange value={mapOneOpacity} onChange={handleRangeOne}/></td>
							<td>tbd</td>
						</tr>
						<tr>
							<td><TopRadio map={!mapOneIsTop} onChange={setTopTwo}/></td>
							<td>Melbourne</td>
							<td><OpacityRange value={mapTwoOpacity} onChange={handleRangeTwo}/></td>
							<td>tbd</td>
						</tr>
					</tbody>
				</table>
			) : null
			}
			{/*<div className="sidebar">*/}
			{/*  Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}*/}
			{/*</div>*/}

			<div className={`maps-holder ${overlayMaps ? 'overlay' : ''}`}>
				<Map
					containerRef={mapContainerOne}
					isSelected={false}
					isTop={mapOneIsTop}
					map={mapOneRef}
					opacity={mapOneOpacity}
					startCoords={routeOne.start}
					end={routeOne.end}
				/>
				<Map
					containerRef={mapContainerTwo}
					isSelected={false}
					isTop={!mapOneIsTop}
					map={mapTwoRef}
					opacity={mapTwoOpacity}
					startCoords={routeTwo.start}
					end={routeTwo.end}
				/>
			</div>
		</div>
	);
};

render(<App/>, document.getElementById('root'));
