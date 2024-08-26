import { keyboard } from "./helpers.js";
import { contain } from "./helpers.js";
import { hitTestRectangle } from "./helpers.js";
import { randomInt } from "./helpers.js";

let Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  TextureCache = PIXI.utils.TextureCache,
  Texture = PIXI.Texture,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  Graphics = PIXI.Graphics;


let stage = new Container(),
  renderer = autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);

loader.add("images/treasureHunter.json").load(setup);

let state,
  explorer,
  treasure,
  blobs,
  chimes,
  exit,
  player,
  dungeon,
  door,
  healthBar,
  message,
  gameScene,
  gameOverScene,
  enemies,
  id;

function setup() {
 
  gameScene = new Container();
  stage.addChild(gameScene);

  
  id = resources["images/treasureHunter.json"].textures;


  dungeon = new Sprite(id["dungeon.png"]);
  gameScene.addChild(dungeon);


  door = new Sprite(id["door.png"]);
  door.position.set(32, 0);
  gameScene.addChild(door);

 
  explorer = new Sprite(id["explorer.png"]);
  explorer.x = 68;
  explorer.y = gameScene.height / 2 - explorer.height / 2;
  explorer.vx = 0;
  explorer.vy = 0;
  gameScene.addChild(explorer);

  
  treasure = new Sprite(id["treasure.png"]);
  treasure.x = gameScene.width - treasure.width - 48;
  treasure.y = gameScene.height / 2 - treasure.height / 2;
  gameScene.addChild(treasure);

  
  let numberOfBlobs = 6,
    spacing = 48,
    xOffset = 150,
    speed = 2,
    direction = 1;


  blobs = [];


  for (let i = 0; i < numberOfBlobs; i++) {
  
    let blob = new Sprite(id["blob.png"]);

    
    let x = spacing * i + xOffset;

    
    let y = randomInt(0, stage.height - blob.height);

   
    blob.x = x;
    blob.y = y;

    
    blob.vy = speed * direction;

    
    direction *= -1;

    
    blobs.push(blob);

    
    gameScene.addChild(blob);
  }

  
  healthBar = new Container();
  healthBar.position.set(stage.width - 170, 6);
  gameScene.addChild(healthBar);

 
  let innerBar = new Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(0, 0, 128, 8);
  innerBar.endFill();
  healthBar.addChild(innerBar);

  
  let outerBar = new Graphics();
  outerBar.beginFill(0xff3300);
  outerBar.drawRect(0, 0, 128, 8);
  outerBar.endFill();
  healthBar.addChild(outerBar);

  healthBar.outer = outerBar;

 
  gameOverScene = new Container();
  stage.addChild(gameOverScene);

 
  gameOverScene.visible = false;

  
  message = new Text("The End!", { font: "64px Futura", fill: "white" });
  message.x = 120;
  message.y = stage.height / 2 - 32;
  gameOverScene.addChild(message);

 
  let left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

  
  left.press = function () {
    
    explorer.vx = -5;
    explorer.vy = 0;
  };


  left.release = function () {
   
    if (!right.isDown && explorer.vy === 0) {
      explorer.vx = 0;
    }
  };


  up.press = function () {
    explorer.vy = -5;
    explorer.vx = 0;
  };
  up.release = function () {
    if (!down.isDown && explorer.vx === 0) {
      explorer.vy = 0;
    }
  };

  right.press = function () {
    explorer.vx = 5;
    explorer.vy = 0;
  };
  right.release = function () {
    if (!left.isDown && explorer.vy === 0) {
      explorer.vx = 0;
    }
  };

 
  down.press = function () {
    explorer.vy = 5;
    explorer.vx = 0;
  };
  down.release = function () {
    if (!up.isDown && explorer.vx === 0) {
      explorer.vy = 0;
    }
  };

 
  state = play;

  
  gameLoop();
}

function gameLoop() {
 
  requestAnimationFrame(gameLoop);

 
  state();

  
  renderer.render(stage);
}

function play() {
 
  explorer.x += explorer.vx;
  explorer.y += explorer.vy;

  
  contain(explorer, { x: 28, y: 10, width: 488, height: 480 });
  

 
  let explorerHit = false;

 
  blobs.forEach(function (blob) {
    
    blob.y += blob.vy;

   
    let blobHitsWall = contain(blob, { x: 28, y: 10, width: 488, height: 480 });

   
    if (blobHitsWall === "top" || blobHitsWall === "bottom") {
      blob.vy *= -1;
    }

    
    if (hitTestRectangle(explorer, blob)) {
      explorerHit = true;
    }
  });

  
  if (explorerHit) {
   
    explorer.alpha = 0.5;

    
    healthBar.outer.width -= 100;
  } else {
   
    explorer.alpha = 1;
  }

 
  if (hitTestRectangle(explorer, treasure)) {
   
    treasure.x = explorer.x + 8;
    treasure.y = explorer.y + 8;
  }

  
  if (healthBar.outer.width < 0) {
    state = end;
    message.text = "You lost!";
  }

 
  if (hitTestRectangle(treasure, door)) {
    state = end;
    message.text = "You won!";
  }
}

function end() {
  gameScene.visible = false;
  gameOverScene.visible = true;
}
