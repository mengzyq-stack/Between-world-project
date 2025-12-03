let bgImg;
let imgs = [];
let showIdx = 0;
let triggered = {};
let customFont;            // 全局字体对象

// --- 音频 ---
let bgm;
let bgmStarted = false;

// 文字相关变量
let showText = false; // 是否显示中央文字
let textContent = "Burn this page that steals your light,              Watch from the embers surge a grassland in flight."; 
let textSizeValue = 80; 
let textColor = [255, 255, 255]; 

let textMargin = 70;

// 燃烧消失动画相关变量
let isBurningOut = false;   // 是否正在从内向外燃烧
let burnProgress = 0;       // 0 ~ 1 燃烧进度
let lastImageIdx = 0;       // 正在被燃烧掉的那张图片编号
let burnShowTextAfter = false; // 燃烧结束后是否显示文字（按 M 时用）

// 专门用于燃烧效果的缓冲画布
let burnBuffer;

function preload() {
  // ⭐ 这里写你的字体文件名（确保和上传的一模一样）
  // 例如你上传的是 "usefont.ttf"，就写 'usefont.ttf'
  customFont = loadFont('usefont.ttf');

  // 背景和前景图片
  bgImg = loadImage('grass.jpg');
  imgs[1] = loadImage('burning7.png');
  imgs[2] = loadImage('burning6.png');
  imgs[3] = loadImage('burning5.png');
  imgs[4] = loadImage('burning4.png');
  imgs[5] = loadImage('burning3.png');
  imgs[6] = loadImage('burning1.png');

  // BGM
  soundFormats('mp3', 'ogg', 'wav');
  bgm = loadSound('fire.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 为燃烧效果创建缓冲画布
  burnBuffer = createGraphics(windowWidth, windowHeight);

  for (let i = 1; i <= 6; i++) triggered[i] = false;
  textWrap(WORD); 
}

function draw() {
  // ⭐ 每一帧一开始设好字体和字号
  if (customFont) {
    textFont(customFont);
  }
  textSize(textSizeValue);

  // 背景
  image(bgImg, 0, 0, width, height);

  // 先画“当前图”（作为底层）
  if (showIdx !== 0 && imgs[showIdx]) {
    image(imgs[showIdx], 0, 0, width, height);
  }

  // 再画“正在燃烧的上一张图”覆盖在上面
  if (isBurningOut && lastImageIdx !== 0 && imgs[lastImageIdx]) {
    burnBuffer.clear();
    burnBuffer.image(imgs[lastImageIdx], 0, 0, width, height);

    // 在 burnBuffer 上擦出不规则烧焦洞
    burnBuffer.erase();

    let maxR = Math.sqrt(width * width + height * height);
    let baseR = burnProgress * maxR;
    let edgeThickness = 80; // 边缘破碎程度

    burnBuffer.push();
    burnBuffer.translate(width / 2, height / 2);
    burnBuffer.beginShape();
    for (let angle = 0; angle < TWO_PI; angle += radians(4)) {
      let nx = Math.cos(angle) * 2.0;
      let ny = Math.sin(angle) * 2.0;
      let n = noise(nx, ny, burnProgress * 4.0);
      let offset = map(n, 0, 1, -edgeThickness, edgeThickness);
      let r = baseR + offset;
      let x = r * Math.cos(angle);
      let y = r * Math.sin(angle);
      burnBuffer.vertex(x, y);
    }
    burnBuffer.endShape(CLOSE);
    burnBuffer.pop();

    burnBuffer.noErase();

    // 叠回主画布
    image(burnBuffer, 0, 0, width, height);

    // 火星点效果
    let edgeR = baseR;
    stroke(255, 180, 80, 220);
    strokeWeight(2.5);
    for (let i = 0; i < 120; i++) {
      let a = random(TWO_PI);
      let rr = edgeR + random(-edgeThickness * 0.4, edgeThickness * 0.4);
      let x = width / 2 + rr * Math.cos(a);
      let y = height / 2 + rr * Math.sin(a);
      point(x, y);
    }
    noStroke();

    // 燃烧进度
    burnProgress += 0.02;  // 数值越小，燃烧越慢
    if (burnProgress >= 1) {
      burnProgress = 1;
      isBurningOut = false;
      lastImageIdx = 0;

      if (burnShowTextAfter) {
        showIdx = 0;
        showText = true;
        burnShowTextAfter = false;
      }
    }
  }

  // 中央文字
  if (showText) {
    fill(textColor);
    textAlign(CENTER, CENTER);
    textSize(textSizeValue);

    // 再保险一点，确保文本使用的就是 customFont
    if (customFont) {
      textFont(customFont);
    }

    let boxWidth = width - textMargin * 2; 
    let boxX = textMargin;                 
    let boxY = height / 2 - 200;           

    text(textContent, boxX, boxY, boxWidth, 400); 
  }
}

function keyPressed() {
  // 空格键：跳转到第二个网站
  if (keyCode === 32) {
    window.location.href ="https://mengzyq-stack.github.io/Between-world-site2/";
    return;
  }

  // 第一次按键时启动 BGM
  if (!bgmStarted) {
    userStartAudio();
    if (bgm && bgm.isLoaded()) {
      bgm.loop();
      bgm.setVolume(1.0);
      bgmStarted = true;
    }
  }

  const k = key;
  let target = 0;

  if (k === 'A' || k === 'a') target = 1;
  else if (k === 'B' || k === 'b') target = 2;
  else if (k === 'H' || k === 'h') target = 3;
  else if (k === 'J' || k === 'j') target = 4;
  else if (k === '6') target = 5;
  else if (k === 'X' || k === 'x') target = 6;
  else if (k === 'M' || k === 'm') {
    // M：当前图片燃烧掉，下面是草地，结束后显示文字
    if (!isBurningOut && showIdx !== 0 && imgs[showIdx]) {
      isBurningOut = true;
      burnProgress = 0;
      lastImageIdx = showIdx;
      burnShowTextAfter = true; // 燃烧结束后显示文字
      showIdx = 0;              // 下层只留背景
      showText = false;
    } else if (!isBurningOut && showIdx === 0) {
      // 已经没有图片时按 M：直接显示文字
      showText = true;
    }
    return;
  }

  // 图片键：A / B / H / J / 6 / X（每个只生效一次）
  if (target > 0 && !triggered[target]) {
    triggered[target] = true;

    // 当前没有图片也没有在燃烧：直接显示这张
    if (!isBurningOut && showIdx === 0) {
      showIdx = target;
      showText = false;
    }
    // 当前有图片且没在燃烧：当前图开始燃烧，下一张已经出现在下面
    else if (!isBurningOut && showIdx !== 0 && imgs[showIdx]) {
      isBurningOut = true;
      burnProgress = 0;
      lastImageIdx = showIdx; // 上面这一张要被烧掉
      showIdx = target;       // 下面换成新图
      showText = false;
      burnShowTextAfter = false; // 切图时燃烧结束后不显示文字
    }
    // 正在燃烧时的新按键会被忽略，避免状态冲突
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  burnBuffer = createGraphics(windowWidth, windowHeight);
}
