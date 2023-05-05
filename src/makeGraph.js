
import Graph from './dijkstra.js'

const makeGraph=(nodeFeatures,edgeFeatures,weightParam)=>{

    let G = new Graph();


    nodeFeatures.forEach(f=>{
    
        G.addVertex(f.properties['id'].toString())
       })
    
    edgeFeatures.forEach(f=>{
    
     G.addEdge(f.properties['source'].toString(),f.properties['target'].toString(),f.properties[weightParam])
    })
    return G
}
export default makeGraph