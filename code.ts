  figma.showUI(__html__,{width:300,height:450})

  const nodes = figma.currentPage.selection;

if (nodes.length === 0) {
  figma.notify('Select the element to apply the noise effect to')
  figma.closePlugin()
}

const isValidImageSize=(width:number,height:number)=> {
  const MAX_SAFE_SIZE = 4096
  return width <= MAX_SAFE_SIZE && height <= MAX_SAFE_SIZE;
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
    createdNode = figma.createVector()
    createdNode = node.clone()
  }
  else if ( type === 'TEXT'){
    createdNode = figma.createText()
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
      if (!isValidImageSize(width,height)) {
        figma.notify('Sides must be less than 4096px')
        figma.closePlugin()
        break
      }
      figma.ui.postMessage({width,height}) 
    }

figma.ui.onmessage = async (message) => {
  const {pngBytes,mixBlendMode}= message
      try {
        for(const node of nodes){
      const image= figma.createImage(pngBytes)
          
      const element = createNodeOfType(node)
      
      element.fills = [
        {
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL',
          blendMode:mixBlendMode,
          // opacity: Number(imageOpacity),
        }
      ]
      element.resize(node.width,node.height)
      
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




