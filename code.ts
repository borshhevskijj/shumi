  figma.showUI(__html__,{width:300,height:405})

  const nodes = figma.currentPage.selection;



if (nodes.length === 0) {
  figma.notify('Select the element to apply the noise effect to')
  figma.closePlugin()
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
  } else {
    createdNode = figma.createRectangle();
  }

  createdNode.name = 'noiseEffect';
  createdNode.x = x;
  createdNode.y = y;
  createdNode.resize(width, height);

  if ('cornerRadius' in node && node.cornerRadius) {
    createdNode.cornerRadius = node.cornerRadius;
  }
  return createdNode;
};

const MAX_SAFE_SIZE = 4096
const isValidImageSize=(width:number,height:number)=> {
  return width <= MAX_SAFE_SIZE && height <= MAX_SAFE_SIZE;
}

const getNodeOptions= async ()=>{
  for(const node of nodes){
    const css = await node.getCSSAsync()
    const {background} = css
    const {width,height} = node
    console.log(css);
    console.log(background);



  //   if(node.type === 'RECTANGLE'){
  //     const imageId = node.id;
  // // Запрашиваем метаданные картинки
    
  // // Получаем ссылку на оригинал картинки
  //   const imageSrc = imageMeta?.getBytesAsync()
  //   console.log(imageSrc);
    
  //   }
    if (!isValidImageSize(width,height)) {
      figma.notify('Sides must be less than 4096px')
      figma.closePlugin()
      break
    }
    figma.ui.postMessage({width,height,background}) 
  }
}
getNodeOptions()

figma.ui.onmessage = async (message) => {
  const {pngBytes,imageOpacity,mixBlendMode}= message
  
      try {
        for(const node of nodes){
          console.log(await node.getCSSAsync());
          //background
      const image= figma.createImage(pngBytes)

      const element = createNodeOfType(node)
      element.fills = [
        {
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL',
          blendMode:mixBlendMode,
          opacity: Number(imageOpacity),
        }
      ]
      

      // const frame = figma.createFrame();
    const parent = node.parent || figma.currentPage
    
    const group = figma.group([node,element], parent)
    
    group.name = `${node.name}_${element.name}`

    }
    figma.closePlugin()
  } catch (error:any) {
    figma.notify(error.message)
    figma.closePlugin()
  }

}




