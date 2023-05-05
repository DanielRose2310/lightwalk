import edgesData from './edges.json'
import nodesData from './nodes.json' 
const edgeFeatures = edgesData['features'];
const nodeFeatures = nodesData['features'];

const getPath=(Graph,origin,target)=>{
    // let G = new Graph();
    
    // nodeFeatures.forEach(f=>{
    
    //     G.addVertex(f.properties['id'].toString())
    //    })
    
    // edgeFeatures.forEach(f=>{
    
    //  G.addEdge(f.properties['source'].toString(),f.properties['target'].toString(),f.properties[weightParam])
    // })
    let shortestPath = Graph.Dijkstra(origin,target)
    let pathFeatures = []
    let origCoords = [nodeFeatures.find(n=>n.properties.id==shortestPath[0]).geometry.coordinates[1],
    nodeFeatures.find(n=>n.properties.id==shortestPath[0]).geometry.coordinates[0]]

    let targetCoords = [nodeFeatures.find(n=>n.properties.id==shortestPath[shortestPath.length-1]).geometry.coordinates[1],
    nodeFeatures.find(n=>n.properties.id==shortestPath[shortestPath.length-1]).geometry.coordinates[0]]
    shortestPath.slice(0,-1).forEach((n,i)=>{
        
        let e = edgeFeatures.find(e=>
           
            (e.properties.source.toString()==n && e.properties.target.toString()==shortestPath[i+1])
        //|| e.properties.target.toString()==n && e.properties.source.toString()==shortestPath[i+1])
        // &&
        // (e.geometry)
        )
        if (e){
            pathFeatures.push(e)
        }

    
    })
    pathFeatures = pathFeatures.map(geom=>({...geom,geometry:{...geom,coordinates: geom.geometry.coordinates.map(el=>{
        return [el[1],el[0]]
    })}}))
    let lengthSum = pathFeatures.reduce((_, n) => _ + n.properties.length, 0);
    let ExertionSum = pathFeatures.reduce((_, n) => _ + n.properties.elev_diff, 0);

    return [pathFeatures,lengthSum,ExertionSum]

}
export default getPath