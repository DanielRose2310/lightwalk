// import edgesData from './edges.json'
// import nodesData from './nodes.json' 
// const edgeFeatures = edgesData['features'];
// const nodeFeatures = nodesData['features'];

const getPath=(Graph,nodeFeatures,edgeFeatures,origin,target)=>{

    let shortestPath = Graph.Dijkstra(origin,target)
    let pathFeatures = []

    shortestPath.slice(0,-1).forEach((n,i)=>{
        
        let e = edgeFeatures.find(e=>
           
            (e.properties.source.toString()==n && e.properties.target.toString()==shortestPath[i+1])
 
        )
        if (e){
            pathFeatures.push(e)
        }

    
    })
    pathFeatures = pathFeatures.map(geom=>({...geom,geometry:{...geom,coordinates: geom.geometry.coordinates.map(el=>{
        return [el[1],el[0]]
    })}}))
    let lengthSum = pathFeatures.reduce((_, n) => _ + n.properties.length, 0);
    //let ExertionSum = pathFeatures.reduce((_, n) => _ + n.properties.exertion, 0);

    return [pathFeatures,lengthSum]

}
export default getPath