import edgesData from './edges.json' 
import nodesData from './nodes.json' 
import borders from './borders.json' 
import 'leaflet/dist/leaflet.css';
import getPath from './getPath.js'
import ReactLoading from "react-loading";

import { useState,useEffect,useRef } from 'react';
import { MapContainer, TileLayer, useMap,LineString,  Polyline,useMapEvents,Marker,Polygon,Popup,Tooltip
} from 'react-leaflet'
import L,{Icon} from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import nearestPoint from '@turf/nearest-point'
import {point, round} from '@turf/turf'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactDOMServer from 'react-dom/server';
import makeGraph from './makeGraph.js'
function getMiddle(arr){
  return arr.splice(Math.floor((arr.length-1) / 2), 1)[0]
}



const edgeFeatures = edgesData['features'];
const nodeFeatures = nodesData['features'];

const borderGeoms = borders.features[0].geometry.coordinates[0].map(el=>[el[1],el[0]])


const App=()=>{
  const [graph,setGraph] = useState(null)
  const [controlGraph,setControlGraph] = useState(null)
  const [map, setMap] = useState(null);
const [loading,setLoading] = useState(true)
  const [originNode, setOriginNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [pathGeoms, setPathGeoms] = useState([])
  const [otherPathGeoms, setOtherPathGeoms] = useState([])

  const [coolLength, setCoolLength] = useState(0)
  // const [coolExertion, setCoolExertion] = useState(0)

  const [otherLength, setOtherLength] = useState(0)
  const featureGroupRef = useRef();
  const timeoutOffset = 40

useEffect(()=>{
setControlGraph(makeGraph(nodeFeatures,edgeFeatures,'length'))
setGraph(makeGraph(nodeFeatures,edgeFeatures,'elev_diff'))

},[])

useEffect(()=>{
if (graph && controlGraph){
  setLoading(false)
}

},[graph,controlGraph])

  useEffect(()=>{
    if (!originNode | !targetNode)
    {setPathGeoms([])
      setOtherPathGeoms([])
    }
  
    if (originNode && targetNode)
    {
      let pathData = getPath(graph,String(originNode.properties.id),String(targetNode.properties.id))
      let path = pathData[0]
      let coolPathLength = pathData[1]
      path.forEach((pathSegment,i)=>{
       let timeOut = setTimeout(() => {
          setPathGeoms((pathGeoms) => [...pathGeoms, pathSegment])
       }, timeoutOffset*i);
       setCoolLength(coolPathLength)
      return () => {clearTimeout(timeOut)};
      })
      

       pathData = getPath(controlGraph,String(originNode.properties.id),String(targetNode.properties.id))
       path = pathData[0]
       let otherLength = pathData[1]
      path.forEach((pathSegment,i)=>{
       let timeOut = setTimeout(() => {
          setOtherPathGeoms((pathGeoms) => [...pathGeoms, pathSegment])
       }, timeoutOffset*i);
       setOtherLength(otherLength)
      return () => {clearTimeout(timeOut)};
      })

  }
  },[originNode,targetNode])

  const customIcon = new L.DivIcon({
    html:  "https://www.svgrepo.com/show/500813/coffee.svg",
  });

  const Markers = () => {
    const markerIcon = L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png"
    });

    const sunIcon =  L.icon({
      iconSize: [12, 12],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "https://www.svgrepo.com/show/24307/sun.svg",
    });

    const map = useMapEvents({
        click(e) {                                
           
           let targetPoint = point([ e.latlng.lng,e.latlng.lat])      
            
           if (!targetNode && !originNode){
            setOriginNode(nearestPoint(targetPoint, nodesData))

     
           }
            if (originNode && !targetNode){
            setTargetNode(nearestPoint(targetPoint, nodesData));

           }
            if (originNode && targetNode){
            setOriginNode(null)
            setTargetNode(null)
           }

        },            
    })



    return (
      <>

      {originNode &&
            <Marker           
            position={[originNode.geometry.coordinates[1],originNode.geometry.coordinates[0]]}
            icon={markerIcon}
            />}
  {targetNode && 
  <Marker           
  position={[targetNode.geometry.coordinates[1],targetNode.geometry.coordinates[0]]}
  icon={markerIcon}

  />}
        
        </>
          
    )   
    
}

  return  <>{loading ? (
  <div  className="loader">
  <ReactLoading
          type={"bars"}
          color={"#03fc4e"}
          height={100}
          width={100}
        />
        </div>
        ) :
  <MapContainer center={[32.794044,  34.989571]} zoom={15} ref={featureGroupRef} 
  // bounds={L.latLngBounds(borderGeoms)}
  // maxBounds={L.latLngBounds(borderGeoms)}
  // minZoom={14}
  >


  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //url='https://osm.gs.mil/tiles/humanitarian/{z}/{x}/{y}.png'
  />
  <Polyline key={'borders'} positions={
         borderGeoms
        } color={'black'} />
         
          {pathGeoms ?<>
          {/* <Polyline key={'path_cool'} positions={[
          pathGeoms
        ]} color={'blue'} /> */}
        {pathGeoms.map((geom,i)=>
        <Polyline key={'path_cool_'+String(i)} positions={
          geom.geometry.coordinates
        } color={'blue'} />)}
        
        
      {pathGeoms.length &&  <Popup
        className='cool_popup'
        autoClose={false}
        position={pathGeoms[pathGeoms.length-1].geometry.coordinates[0]}
        >{round(coolLength)} m 
        </Popup>
        }
    
        </>:
        null}
     {otherPathGeoms.length ?
     <>
         {/* <Polyline key={'path_short'} positions={[
            otherPathGeoms
        ]} 
        color={'red'} /> */}
        {otherPathGeoms.map((geom,i)=>
          <Polyline key={'path_short_'+String(i)} positions={
          
            geom.geometry.coordinates
        } 
        color={'red'} />)}
        <Popup
        className='short_popup'
        autoClose={false}
        position={pathGeoms[0].geometry.coordinates[0]}
        >{round(otherLength)} m</Popup>
    </>
        :
        null}
        <Markers/>
</MapContainer>
}
</>
}

export default App