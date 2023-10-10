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

const chunkSize = 1500;
function splitBlockIntoChunks(blockWidth:number,blockHeight:number) {
  const chunkWidthAmount = Math.ceil(blockWidth / chunkSize);
  const chunkHeightAmount = Math.ceil(blockHeight / chunkSize);


  return {chunkWidthAmount,chunkHeightAmount}
}


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
// createdNode.resize(width, height);

return createdNode;
};


type sizes = {
  width:number|null
  height:number|null
}
  for(const node of nodes){
    const {width,height} = node
    const {chunkWidthAmount,chunkHeightAmount} = splitBlockIntoChunks(width,height)
    let sizes:sizes ={
      width:15000,
      height:15000
    }
    // if (width <= chunkSize) {
    //   sizes.width = width
    // }
    // else{
    //   sizes.width = chunkSize
    // }
    //  if(height <=chunkSize){
    //   sizes.height = height
    // }
    // else{
    //    sizes.height = chunkSize
    //  }
    //  console.log(sizes,'sizes');
     
    figma.ui.postMessage(sizes) 
  }

figma.ui.onmessage = async (message) => {
const {pngBytes,mixBlendMode}= message
    try {
      for(const node of nodes){

        const {width,height} = node
        // if (!isValidImageSize(width,height)) {
        //   figma.notify(`For better performance, try to keep element size under ${MAX_SAFE_SIZE}px`)
        // }
        const {chunkWidthAmount,chunkHeightAmount} = splitBlockIntoChunks(width,height)
        // console.log(chunkWidthAmount,chunkHeightAmount,'chunkWidthAmount,chunkHeightAmount');
        
        const image= figma.createImage(pngBytes)
        const element = createNodeOfType(node)
        element.resize(15000,15000)
        element.fills = [
          {
            type: 'IMAGE',
            imageHash: image.hash,
            scaleMode: 'TILE',
            scalingFactor: 0.5,
            blendMode:mixBlendMode,
          }
        ]
        // __
        
        const parent = node.parent || figma.currentPage
        const chunks =[]



        // for (let i = 0; i < chunkWidthAmount + 1; i++) {
        //   const elementClone = element.clone()
        //   elementClone.x = posX
        //   posX += chunkSize
        //   chunks.push(elementClone)

        //   if (i === chunkWidthAmount) {
        //     console.log('i === chunkWidthAmount');
            
        //     if (bottomPos <= posY) {
        //       console.log('bottomPos <= posY');
        //     }
        //     i=0
        //     posX = node.x
        //     elementClone.y = posY
        //     posY += chunkSize 
        //     // if тут описать случай при котором нужно завершить цикл (когда posY будет больше или равер node.y )
        //   }
        // }


        // const tempRect = figma.createRectangle()
        // tempRect.name = 'tempRect'
        // tempRect.resize(width,height)  

        // let posX = tempRect.x
        // let posY = tempRect.y
        // let posX = node.x
        // let posY = node.y

        // const nodeBottomYpos = node.y + node.height - chunkSize
        // const nodeBottomXpos = node.x + node.width - chunkSize

        // const randomRotation =()=>{ // for relativeTransform prop
        //   const randomNumber = Math.random() * 100
        //   if (randomNumber <=33) {
        //     return  [[0, -1, 0],[1, 0, 0]]
        //   }
        //   if (randomNumber <=66 && randomNumber >33) {
        //     return [[-1, 0, 0],[0, -1, 0]]
        //   }
        //     return [[1, 0, 0],[0, 1, 0]]
        // }
        
        // let heightCounter =0
        // for (let chunkCount = 0; chunkCount <= chunkWidthAmount; chunkCount++) {
        //   if (chunkCount === chunkWidthAmount) {
        //     chunkCount=0
        //     posX = node.x
        //     posY+=chunkSize
        //     heightCounter++
        //   }
        //   if (heightCounter === chunkHeightAmount) {
        //       break
        //   }

        //   const elementClone = element.clone()
        //   elementClone.x = posX
        //   elementClone.y = posY
        //   chunks.push(elementClone)
        //   posX += chunkSize
        // }
     


        // -------------    
        // const tempGroup = figma.group([tempRect,...chunks], figma.currentPage)
        // tempGroup.name = 'tempRectGroup'
    
        // const slice = figma.createSlice()
        // slice.x = tempRect.x
        // slice.y = tempRect.y
        // slice.resize(width,height)

        // const sliceBytes = await slice.exportAsync()
        // const noiseImg = figma.createImage(sliceBytes) 
        // const tempRect2 = figma.createRectangle()

        // tempRect2.fills =[{
        //   type: 'IMAGE',
        //   imageHash: noiseImg.hash,
        //   scaleMode: 'TILE',
        //   // scalingFactor:1
        // }]
        // tempRect.remove()
        // slice.remove()
        // tempGroup.remove()
        
        // const group = figma.group([node,tempRect2], parent)
    // -------------

    // parent.appendChild(element)
   
    const group = figma.group([node,element], parent)
    
    group.name = `${node.name}_${element.name}`
    
  }
  figma.closePlugin()
} catch (error:any) {
  figma.notify(error.message)
  figma.closePlugin()
}

}