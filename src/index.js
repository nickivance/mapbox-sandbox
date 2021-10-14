import React from 'react';
import {render} from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import mapboxgl from '!mapbox-gl';

import { useRef, useEffect, useState } from 'react';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = ({containerRef, isTop, map, opacity, startCoords}) => {
	const [lat, setLat] = useState(startCoords[0]);
	const [lng, setLng] = useState(startCoords[1]);
	const [zoom, setZoom] = useState(14);

	useEffect(() => {
		if (map.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: containerRef.current,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [lng, lat],
			zoom: zoom
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

const OpacityRange = ({name, value, onChange}) => {
	return (
		<div>
			<label>{name}{' '}
				<input type='range' onChange={onChange} step={5} value={value}/>
				<span>{value}</span>
			</label>
		</div>
	);
};

const TopRadio = ({map, name, onChange}) => {
	return (
		<label><input checked={map} onChange={onChange} type='radio'/> {name}</label>
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
	const startCoordinatesOne = [45.53652083427686, -122.64854260371082];
	const startCoordinatesTwo = [-37.80131284816989, 144.99433483493962];
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


	return (
		<div>
			<h2>Hi there!</h2>
			<form>
				<h3>Opacity:</h3>
				<OpacityRange name='Map 1' value={mapOneOpacity} onChange={handleRangeOne}/>
				<OpacityRange name='Map 2' value={mapTwoOpacity} onChange={handleRangeTwo}/>
				<h3>Top Layer:</h3>
				<div>
					<TopRadio map={mapOneIsTop} name="Map 1" onChange={setTopOne}/>
					<TopRadio map={!mapOneIsTop} name="Map 2" onChange={setTopTwo}/>
				</div>

			</form>
			{/*<div className="sidebar">*/}
			{/*  Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}*/}
			{/*</div>*/}

			<div>
				<Map
					containerRef={mapContainerOne}
					isSelected={false}
					isTop={mapOneIsTop}
					map={mapOneRef}
					opacity={mapOneOpacity}
					startCoords={startCoordinatesOne}
				/>
				<Map
					containerRef={mapContainerTwo}
					isSelected={false}
					isTop={!mapOneIsTop}
					map={mapTwoRef}
					opacity={mapTwoOpacity}
					startCoords={startCoordinatesTwo}
				/>
			</div>
		</div>
	);
};

render(<App/>, document.getElementById('root'));
