import edgesData from './edges.json' 
import nodesData from './nodes.json' 
import borders from './borders.json' 
import 'leaflet/dist/leaflet.css';
import getPath from './getPath.js'
import ReactLoading from "react-loading";
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useState,useEffect,useRef } from 'react';
import { MapContainer, TileLayer, useMap,LineString,  Polyline,useMapEvents,Marker,Polygon,Popup,Tooltip
} from 'react-leaflet'
import L,{Icon} from 'leaflet';
import nearestPoint from '@turf/nearest-point'
import {point, round} from '@turf/turf'
import makeGraph from './makeGraph.js'

let edgeFeatures = edgesData['features'];
let nodeFeatures = nodesData['features'];

const borderGeoms = borders.features[0].geometry.coordinates[0].map(el=>[el[1],el[0]])


const App=()=>{
  const [graph,setGraph] = useState(null)
  const [controlGraph,setControlGraph] = useState(null)
  const [map, setMap] = useState(null);
  const [exertionCoef,setExertionCoef] = useState(0.5)
const [loading,setLoading] = useState(true)
  const [originNode, setOriginNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [pathGeoms, setPathGeoms] = useState([])
  const [otherPathGeoms, setOtherPathGeoms] = useState([])
  const [edgesWithCoef,setEdgesWithCoef] = useState(null)
  const [coolLength, setCoolLength] = useState(0)
  // const [coolExertion, setCoolExertion] = useState(0)
  const [selectedSliderVal,setSelectedSliderVal] = useState(null)
  const [otherLength, setOtherLength] = useState(0)
  const [fetching,setFetching] = useState(false)
  const featureGroupRef = useRef();
  //const timeoutOffset = 40
  const timeoutOffset = 0

useEffect(()=>{
if (!edgeFeatures){return}
edgeFeatures = edgeFeatures.map(edge=> 
  {


  return {...edge,properties:
  {...edge.properties, exertion:
  edge.properties.elev_diff>0 ? 
    edge.properties['length']
    + 
  (edge.properties.elev_diff<1 ? 1 : (
    edge.properties['length'] *
    (edge.properties.elev_diff
     * exertionCoef)
     
     * (edge.properties.highway.includes('steps') ? 0.5 : 1)
     ))
  : edge.properties['length']

  
}}
}
  )
  setEdgesWithCoef(edgeFeatures)
},[exertionCoef,edgesData])

useEffect(()=>{
  if (!edgesWithCoef) return
  setFetching(true)
setControlGraph(makeGraph(nodeFeatures,edgeFeatures,'length'))
setGraph(makeGraph(nodeFeatures,edgesWithCoef,'exertion'))
},[edgesWithCoef])

useEffect(()=>{
if (graph && controlGraph){
  setLoading(false)
}

},[graph,controlGraph])

  useEffect(()=>{
      setPathGeoms([])
      setOtherPathGeoms([])
    if (originNode && targetNode)
    {
    setFetching(true)
      let pathData = getPath(graph,      
        nodeFeatures,
        edgesWithCoef,
        String(originNode.properties.id),
      String(targetNode.properties.id)
      )
      let path = pathData[0]
      let coolPathLength = pathData[1]
          setPathGeoms(path)
       setCoolLength(coolPathLength)
      
       pathData = getPath(controlGraph,      
        nodeFeatures,
        edgesWithCoef,
        String(originNode.properties.id),
      String(targetNode.properties.id)
      )
       path = pathData[0]
       let otherLength = pathData[1]
          setOtherPathGeoms(path)
       setOtherLength(otherLength)
  }
  setFetching(false)

  },[originNode,targetNode,graph,edgesWithCoef,controlGraph])

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
        <div style={{cursor: (fetching ? 'wait' : 'default')}}>
         <Box sx={{ width: 300, zIndex: 1000,position:'absolute',backgroundColor:'grey',right:10,padding:1,
         top:10,
         display:"flex",
         justifyContent:"center",
         flexDirection:'column',
         alignItems:"center",
         opacity:0.8,
        borderRadius:3,pointerEvents:'all'

      }}
      center
      >
        <Typography variant="h6" >INCLINE COEFFICIENT</Typography>
<Slider

  aria-label="Beta"
  //value={exertionCoef}
  defaultValue={0.5}
  valueLabelDisplay="auto"
  step={0.1}
  marks
  sx={{cursor: (fetching ? 'wait' : 'pointer')}}
  min={0}
  max={1}
  onChange={
    
    (e)=>{      
      setSelectedSliderVal(e.target.value)
    }
    }
  onChangeCommitted={
    (e)=>{
      setExertionCoef(selectedSliderVal)
    }
  }
/>
</Box>
  <MapContainer center={[32.794044,  34.989571]} zoom={13} ref={featureGroupRef} 
  bounds={L.latLngBounds(borderGeoms)}
  maxBounds={L.latLngBounds(borderGeoms)}
  minZoom={12}
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

</div>
}
</>
}

export default App