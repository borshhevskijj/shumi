figma.showUI(__html__,{width:300,height:450})

const nodes = figma.currentPage.selection;

if (!nodes.length) {
figma.notify('Select the element to apply the noise effect to')
figma.closePlugin()
}



const MAX_SAFE_SIZE = 4000
const isValidImageSize=(width:number,height:number)=> {
return width <= MAX_SAFE_SIZE && height <= MAX_SAFE_SIZE;
}


function getParts(size:number) {
  const numChunks = Math.ceil(size / MAX_SAFE_SIZE);
  
  // Рассчитываем размер каждой части
  const chunkHeight = Math.floor(size / numChunks);
  
  // Создаем массив для хранения размеров частей
  const chunks = Array(numChunks).fill(chunkHeight);
  console.log({numChunks,chunkHeight,chunks});
  return {height:chunkHeight,chunks}
}

// console.log(getParts(12000),3);
// console.log(getParts(8000),2);
// console.log(getParts(4000),1);
// console.log(getParts(12345));




const createNodeOfType = (node:SceneNode) => {
const {width,height,x,y,type} = node
let createdNode; 
if (type === 'ELLIPSE') {
  createdNode = figma.createEllipse();
} else if (type === 'POLYGON' ) {
  createdNode = figma.createPolygon();
  if ('pointCount' in node) {
    createdNode.pointCount = node.pointCount;
  }
}
else if ( type === 'VECTOR'){
  createdNode = node.clone()
}
else if ( type === 'TEXT'){
  createdNode = node.clone()
}
else {
  createdNode = figma.createRectangle();
}
if ('cornerRadius' in node &&
 node.cornerRadius &&
  createdNode.type !== 'TEXT') {
    createdNode.cornerRadius = node.cornerRadius;
}

createdNode.name = 'noiseEffect';
createdNode.x = x;
createdNode.y = y;
createdNode.resize(width, height);

return createdNode;
};


  for(const node of nodes){
    const {width,height} = node

    figma.ui.postMessage({width,height}) 
  }

figma.ui.onmessage = async (message) => {
const {pngBytes,mixBlendMode}= message
    try {
      for(const node of nodes){
        const {width,height} = node
        if (!isValidImageSize(width,height)) {
          figma.notify(`For better performance, try to keep element size under ${MAX_SAFE_SIZE}px`)
        }
        const image= figma.createImage(pngBytes)

        const element = createNodeOfType(node)

        element.fills = [
          {
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: 'FILL',
            blendMode:mixBlendMode,
          }
        ]
    element.resize(width,height)
    
    const parent = node.parent || figma.currentPage
    parent.appendChild(element)
  
    const group = figma.group([node,element], parent)
    group.name = `${node.name}_${element.name}`
    
  }
  figma.closePlugin()
} catch (error:any) {
  figma.notify(error.message)
  figma.closePlugin()
}

}