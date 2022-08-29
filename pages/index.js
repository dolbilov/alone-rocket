'use strict';
/** @type {import("./typings/phaser")} */

const MET_NUMBER = 5,
  WIDTH = 1280,
  HEIGHT = 720,
  START_X = WIDTH / 2,
  START_Y = HEIGHT / 2,
  ROTATION_FIX = Math.PI / 2,
  BLOCK_SPEED = 2,
  ANGLE_CHANGING_SPEED = 2,
  MS_TO_S = 1 / 1000,
  TIME_LIMIT = 8,
  TIME_BEFORE_WARNING = 5,
  COINS_NUMBER = 6,
  COIN_SPEED = 3,
  FUEL_CONSUMPTION_SPEED = 0.09,
  FUEL_BOOST = 20,
  VERSION = '2.1.0-rtm';

let game,
  rocket,
  rocketLogo,
  rocketSet = {
    rotationSpeed: 180,
    acceleration: 200,
    maxSpeed: 85,
    drag: 25,
    gravity: 100,
  },
  score = 0,
  textConfig = {
    fontSize: 72,
    fontFamily: 'VGAfontUpdate11',
    align: 'center',
  },
  logoAngle = 0,
  menuMusic,
  gameMusic,
  bg_0,
  bg_1,
  mets = [],
  coins = [],
  localStorageNameForBestScore = 'jarisBestScore',
  localStorageNameForHardBestScore = 'jarisHardBestScore',
  localStorageNameForHardMode = 'isHardModeEnable',
  sessionStorageNameForNewGame = 'isNewGame',
  texture1Count = 0,
  texture2Count = 0,
  currentNumber = 0,
  scoreText,
  bootText,
  rocketSound,
  hardModeText,
  myCam,
  endGame = false,
  startTime = null,
  currentTime,
  losingControlText = null,
  losingTimeCounter = 0,
  wasDown = false,
  collectSound,
  instructionsText;

window.onload = function () {
  let config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: rocketSet.gravity },
        debug: false,
      },
    },
    audio: { disableWebAudio: true },
    scene: [bootScene, startGameScene, previewScene, gameScene, endGameScene],
  };
  game = new Phaser.Game(config);
  window.focus();
};

/* Scenes set-up */
class bootScene extends Phaser.Scene {
  constructor() {
    super('bootScene');
  }

  preload() {
    //Local & Session storage's elements control
    if (sessionStorage.getItem(sessionStorageNameForNewGame) === null) {
      sessionStorage.setItem(sessionStorageNameForNewGame, 'true');
    }

    if (localStorage.getItem(localStorageNameForBestScore) === null) {
      localStorage.setItem(localStorageNameForBestScore, 0);
    }

    if (localStorage.getItem(localStorageNameForHardBestScore) === null) {
      localStorage.setItem(localStorageNameForHardBestScore, 0);
    }

    if (localStorage.getItem(localStorageNameForHardMode) === null) {
      localStorage.setItem(localStorageNameForHardMode, 'false');
    }

    // Make preloading scene
    if (sessionStorage.getItem(sessionStorageNameForNewGame) === 'true') {
      let d = 15;
      let progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(START_X - 160, START_Y - 25 - d, 320, 50);

      let loadingText = this.make.text({
        x: START_X,
        y: START_Y + 30,
        text: 'Loading...',
      });
      loadingText.setOrigin(0.5, 0.5);

      let percentText = this.make.text({
        x: START_X,
        y: START_Y + 55,
        text: '0%',
      });
      percentText.setOrigin(0.5, 0.5);

      let assetText = this.make.text({
        x: START_X,
        y: START_Y + 80,
        text: '',
      });
      assetText.setOrigin(0.5, 0.5);

      let progressBar = this.add.graphics();

      this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(START_X - 150, START_Y - 15 - d, 300 * value, 30);
      });

      this.load.on('fileprogress', function (file) {
        assetText.setText('Loading asset: ' + file.key);
      });

      this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
      });
    }

    /*  Loading assets  */
    //Spritesheets load
    this.load.spritesheet('explosion', './assets/img/explosion.png', {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 23,
    });
    this.load.spritesheet('coins', './assets/img/coins.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: 4,
    });
    this.load.spritesheet('mets', './assets/img/mets.png', {
      frameWidth: 90,
      frameHeight: 70,
      endFrame: 5,
    });

    //Images load
    this.load.image('preview', './assets/img/preview.jpg');
    this.load.image('earth', './assets/img/earth.jpg');
    this.load.image('kvantumLogo', './assets/img/kvantumLogo.png');
    this.load.image('githubLogo', './assets/img/githubLogo.png');
    this.load.image('ground', './assets/img/ground.png');
    this.load.image('startButton', './assets/img/startButton.png');
    this.load.image('background_0', './assets/img/background_0.png');
    this.load.image('background_1', './assets/img/background_1.png');
    this.load.image('newGameButton', './assets/img/newGameButton.png');
    this.load.image('engineOff', './assets/img/rocket/engineOff.png');
    this.load.image('engineOn_1', './assets/img/rocket/engineOn_1.png');
    this.load.image('engineOn_2', './assets/img/rocket/engineOn_2.png');
    this.load.image('leftRotating_1', './assets/img/rocket/leftRotating_1.png');
    this.load.image('leftRotating_2', './assets/img/rocket/leftRotating_2.png');
    this.load.image(
      'leftUpRotating_1',
      './assets/img/rocket/leftUpRotating_1.png'
    );
    this.load.image(
      'leftUpRotating_2',
      './assets/img/rocket/leftUpRotating_2.png'
    );
    this.load.image(
      'rightRotating_1',
      './assets/img/rocket/rightRotating_1.png'
    );
    this.load.image(
      'rightRotating_2',
      './assets/img/rocket/rightRotating_2.png'
    );
    this.load.image(
      'rightUpRotating_1',
      './assets/img/rocket/rightUpRotating_1.png'
    );
    this.load.image(
      'rightUpRotating_2',
      './assets/img/rocket/rightUpRotating_2.png'
    );
    this.load.image('barrel', './assets/img/barrel.png');
    this.load.image('startplace', './assets/img/startplace.png');

    //Audio load
    this.load.audio('startGameSceneMusic', [
      './assets/audio/startGameSceneMusic.ogg',
      './assets/audio/startGameSceneMusic.mp3',
    ]);
    this.load.audio('gameSceneMusic', [
      './assets/audio/gameSceneMusic.ogg',
      './assets/audio/gameSceneMusic.mp3',
    ]);
    this.load.audio('boom', [
      './assets/audio/boom.ogg',
      './assets/audio/boom.mp3',
    ]);
    this.load.audio('rocketSound', [
      './assets/audio/rocketSound.ogg',
      './assets/audio/rocketSound.mp3',
    ]);
    this.load.audio('collectSound', [
      './assets/audio/collectSound.ogg',
      './assets/audio/collectSound.mp3',
    ]);
    this.load.audio('countdown', [
      './assets/audio/countdown.ogg',
      './assets/audio/countdown.mp3',
    ]);
  }

  create() {
    if (sessionStorage.getItem(sessionStorageNameForNewGame) !== 'true') {
      this.scene.start('gameScene');
    }

    let preview = this.add.sprite(START_X, START_Y, 'preview');
    preview.setInteractive();
    preview.on(
      'pointerdown',
      function () {
        this.scene.start('startGameScene');
      },
      this
    );

    bootText = this.add
      .text(START_X, START_Y, 'Tap anywhere to start', textConfig)
      .setOrigin(0.5, 0.5);

    let isTextBecomingVisible = false;
    setInterval(function () {
      if (!isTextBecomingVisible) {
        bootText.alpha -= 0.01;
        if (bootText.alpha === 0) {
          isTextBecomingVisible = true;
        }
      } else {
        bootText.alpha += 0.01;
        if (bootText.alpha === 1) {
          isTextBecomingVisible = false;
        }
      }
    }, 10);
  }
}

class startGameScene extends Phaser.Scene {
  constructor() {
    super('startGameScene');
  }

  create() {
    menuMusic = this.sound.add('startGameSceneMusic', { loop: true });
    menuMusic.play();

    this.add.image(START_X, START_Y, 'preview');

    let button = this.add
      .image(START_X, START_Y + 280, 'startButton')
      .setInteractive();
    button.setOrigin(0.5, 0.5);
    button.on(
      'pointerdown',
      function (pointer) {
        menuMusic.stop();
        this.scene.start('previewScene');
      },
      this
    );

    this.add.image(WIDTH * 0.9, START_Y, 'kvantumLogo').setScale(0.5, 0.5);

    rocketLogo = this.add
      .sprite(WIDTH * 0.1, START_Y, 'engineOff')
      .setScale(0.5, 0.5);

    let smallTextConfig = {
      fontSize: 42,
      fontFamily: 'VGAfontUpdate11',
      align: 'center',
    };

    //Version text
    this.add.text(WIDTH - 325, HEIGHT - 75, 'v' + VERSION, {
      fontSize: 56,
      fontFamily: 'VGAfontUpdate11',
      align: 'center',
      color: '#000000',
    });

    //Visit us here text + logo
    this.add.text(20, HEIGHT - 115, 'Visit us here ->', {
      fontSize: 42,
      fontFamily: 'VGAfontUpdate11',
      align: 'center',
      color: '#000000',
    });

    let githubLogo = this.add.image(START_X - 200, HEIGHT - 100, 'githubLogo');
    githubLogo.setInteractive();
    githubLogo.on(
      'pointerdown',
      function () {
        window.open('https://github.com/dolbilov/alone-rocket');
      },
      this
    );

    //Hard mode text
    this.add
      .text(140, HEIGHT - 50, 'Hard mode:', {
        fontSize: 42,
        fontFamily: 'VGAfontUpdate11',
        align: 'center',
        color: '#000000',
      })
      .setOrigin(0.5, 0.5);

    let text2 = '';
    if (localStorage.getItem(localStorageNameForHardMode) === 'true') {
      text2 = 'Enable';
    } else {
      text2 = 'Disable';
    }
    hardModeText = this.add
      .text(360, HEIGHT - 50, text2, {
        fontSize: 42,
        fontFamily: 'VGAfontUpdate11',
        align: 'center',
      })
      .setOrigin(0.5, 0.5);

    if (localStorage.getItem(localStorageNameForHardMode) === 'false') {
      hardModeText.setTint(0xff3300);
    } else {
      hardModeText.setTint(0x009900);
    }

    hardModeText.setInteractive();
    hardModeText.on('pointerdown', function () {
      if (localStorage.getItem(localStorageNameForHardMode) === 'false') {
        hardModeText.text = 'Enable';
        localStorage.setItem(localStorageNameForHardMode, 'true');
        hardModeText.clearTint();
        hardModeText.setTint(0x009900);
      } else {
        hardModeText.text = 'Disable';
        localStorage.setItem(localStorageNameForHardMode, 'false');
        hardModeText.clearTint();
        hardModeText.setTint(0xff3300);
      }
    });

    this.add
      .text(
        START_X,
        START_Y - 290,
        'Just alone rocket\nin the space',
        textConfig
      )
      .setOrigin(0.5, 0.5);
    this.add
      .text(
        START_X - 200,
        START_Y - 165,
        'Directed by:\nAntipov Dmitriy',
        smallTextConfig
      )
      .setOrigin(0.5, 0.5);
    this.add
      .text(
        START_X - 200,
        START_Y - 70,
        'Programmer:\nDolbilov Kirill',
        smallTextConfig
      )
      .setOrigin(0.5, 0.5);
    this.add
      .text(
        START_X - 200,
        START_Y + 90,
        'Designers:\nChirkov Anatoliy\nVedin Ilya\nDaniel Volk\nAlex Finn\nOleg Chernov',
        smallTextConfig
      )
      .setOrigin(0.5, 0.5);
    this.add
      .text(
        START_X + 220,
        START_Y - 10,
        'Thank you to\nall the testers:\nAlex Finn\n\nOleg Chernov\n\nRoman Chernov\n\nDanil Shanin',
        smallTextConfig
      )
      .setOrigin(0.5, 0.5);
  }

  update() {
    rocketLogo.setAngle(logoAngle);
    if (logoAngle < 360) {
      logoAngle++;
    } else {
      logoAngle = 0;
    }
  }
}

class previewScene extends Phaser.Scene {
  constructor() {
    super('previewScene');
  }

  earth;
  bg_0;
  bg_1;
  planet;
  sceneNumber = 1;
  countdown;
  startplace;

  create() {
    this.countdown = this.sound.add('countdown', { loop: false });
    this.countdown.play();

    this.earth = this.add.image(START_X, START_Y, 'earth');

    rocket = this.add.sprite(START_X - 3, START_Y + 317, 'engineOff');
    rocket.setScale(0.25);
    rocket.setDepth(1);

    this.bg_0 = this.add.tileSprite(0, 0, 1280, 720, 'background_0');
    this.bg_0.setOrigin(0, 0);
    this.bg_0.setScrollFactor(0);
    this.bg_0.setVisible(false);

    this.bg_1 = this.add.tileSprite(0, 0, 1280, 720, 'background_1');
    this.bg_1.setOrigin(0, 0);
    this.bg_1.setScrollFactor(0);
    this.bg_1.setAlpha(0.6);
    this.bg_1.setVisible(false);

    this.startplace = this.add
      .sprite(START_X + 25, HEIGHT - 80, 'startplace')
      .setScale(1.5);

    this.planet = this.add.image(START_X, HEIGHT - 150, 'ground');
    this.planet.setScrollFactor(0, 0);
    this.planet.setOrigin(0.5, 0.5);
    this.planet.setScale(1, 0.8);
    this.planet.setVisible(false);

    rocketSound = this.sound.add('rocketSound', { loop: true });
  }

  update() {
    if (!this.countdown.isPlaying & !rocketSound.isPlaying) {
      rocketSound.play();
    }
    //Rocket fly
    if (!this.countdown.isPlaying) {
      setTimeout(() => {
        rocket.y -= 4;
      }, 75);
    }

    //Rocket animation
    if (Math.random() < 0.5) {
      rocket.setTexture('engineOn_1');
    } else {
      rocket.setTexture('engineOn_2');
    }

    //Change scene
    if ((rocket.y < START_Y - HEIGHT / 2 - 100) & (this.sceneNumber == 1)) {
      this.earth.destroy();
      this.bg_0.setVisible(true);
      this.bg_1.setVisible(true);
      this.planet.setVisible(true);
      rocket.y = HEIGHT + 100;
      this.sceneNumber = 2;
    }

    //Start game
    if ((rocket.y == START_Y) & (this.sceneNumber == 2)) {
      rocketSound.stop();
      this.bg_0.destroy();
      this.bg_1.destroy();
      rocket.destroy();
      this.planet.destroy();
      this.startplace.destroy();
      this.scene.start('gameScene');
    }
  }
}

class gameScene extends Phaser.Scene {
  constructor() {
    super('gameScene');
  }

  fuelIndicator;
  fuel = 100;
  isHardModeEnable;

  create() {
    this.isHardModeEnable = localStorage.getItem(localStorageNameForHardMode);
    //Explosion animation
    let animConfig = {
      key: 'explodeAnimation',
      frames: this.anims.generateFrameNumbers('explosion', {
        start: 0,
        end: 23,
        first: 23,
      }),
      frameRate: 20,
      repeat: -1,
    };
    this.anims.create(animConfig);

    //Music & sound
    rocketSound = this.sound.add('rocketSound');
    rocketSound.setVolume(0);

    gameMusic = this.sound.add('gameSceneMusic');
    gameMusic.play({ loop: true });
    gameMusic.setVolume(0.2);

    collectSound = this.sound.add('collectSound');
    collectSound.setVolume(0.5);

    //Background
    bg_0 = this.add.tileSprite(0, 0, 1280, 720, 'background_0');
    bg_0.setOrigin(0, 0);
    bg_0.setScrollFactor(0);

    bg_1 = this.add.tileSprite(0, 0, 1280, 720, 'background_1');
    bg_1.setOrigin(0, 0);
    bg_1.setScrollFactor(0);
    bg_1.setAlpha(0.6);

    this.add
      .image(START_X, HEIGHT - 150, 'ground')
      .setScrollFactor(0, 0)
      .setOrigin(0.5, 0.5)
      .setScale(1, 0.8);

    //Rocket
    rocket = this.physics.add
      .sprite(START_X, START_Y + 300, 'engineOff')
      .setScale(0.25);
    rocket.setDepth(1);
    rocket.body.bounce.setTo(0.25, 0.25);
    rocket.body.maxVelocity.setTo(rocketSet.maxSpeed, rocketSet.maxSpeed);
    rocket.body.drag.setTo(rocketSet.drag, rocketSet.drag);

    myCam = this.cameras.main.startFollow(rocket);

    //Score text
    scoreText = this.add.text(50, 50, score, textConfig);
    scoreText.setOrigin(0.5, 0.5);
    scoreText.setScrollFactor(0);

    //Losint text set-up
    losingControlText = this.add.text(rocket.body.x, rocket.body.y - 500, '', {
      fontSize: 72,
      fontFamily: 'VGAfontUpdate11',
      align: 'center',
      color: '#ff3300',
    });
    losingControlText.setOrigin(0.5, 0.5);
    losingControlText.setScrollFactor(0, 0);
    losingControlText.setVisible(false);

    //Instructions text
    instructionsText = this.add.text(
      rocket.body.x,
      rocket.body.y - 500,
      'Fly up to collect coins\nUse arrows to control rocket',
      {
        fontSize: 56,
        fontFamily: 'VGAfontUpdate11',
        align: 'center',
        color: '#fff',
      }
    );
    instructionsText.setOrigin(0.5, 0.5);
    instructionsText.setScrollFactor(0, 0);
    if (sessionStorage.getItem(sessionStorageNameForNewGame) == 'false') {
      instructionsText.setVisible(false);
    }

    //Make fuel indicator
    if (this.isHardModeEnable == 'true') {
      this.add.graphics().lineStyle(3, 0x00ff00, 1);
      this.add.graphics().strokeRect(97, 27, 306, 36).setScrollFactor(0, 0);

      this.fuelIndicator = this.add.graphics();
      this.fuelIndicator.fillStyle(0xb36b00);
      this.fuelIndicator.fillRect(100, 30, 300, 30);
      this.fuelIndicator.setScrollFactor(0, 0);
    }

    sessionStorage.setItem(sessionStorageNameForNewGame, 'true');

    //Met generate function
    for (let i = 0; i < MET_NUMBER; i++) {
      let met = this.add.sprite(0, 0, 'mets', i);
      this.physics.add.existing(met);
      met.body.setGravityY(0);
      met.body.setMaxVelocity(BLOCK_SPEED);
      met.angle = getRandomInt(0, 360);
      mets.push(met);

      //Generate position
      let ok,
        t = 0;
      do {
        met.setRandomPosition(0, -1.5 * HEIGHT, WIDTH, HEIGHT);
        ok = true;
        for (let j = 0; j < currentNumber; j++) {
          if (Math.abs(met.x - mets[j].x) < 100) {
            ok = false;
            t++;
          }
        }
        if (t === 8) {
          break;
        }
      } while (!ok);

      currentNumber++;
    }

    //Crash check
    this.physics.add.overlap(
      rocket,
      mets,
      function () {
        if (!endGame) {
          this.endGameFunction();
        }
      },
      null,
      this
    );

    /*  Coins generate  */
    //Coins animating config
    let coinsAnimConfig = {
      key: 'coinAnimation',
      frames: this.anims.generateFrameNumbers('coins', {
        start: 0,
        end: 3,
        first: 0,
      }),
      frameRate: 11,
      repeat: -1,
    };

    //Generating
    currentNumber = 0;
    for (let i = 0; i < COINS_NUMBER; i++) {
      let coin;
      if (this.isHardModeEnable == 'false') {
        //NOT hard mode
        coin = this.add.sprite(0, 0, 'coins', 0);
        coin.setScale(2);

        //Coin animate creating
        this.anims.create(coinsAnimConfig);
        coin.play('coinAnimation');
      } else {
        //Hard mode
        coin = this.add.sprite(0, 0, 'barrel');
      }
      this.physics.add.existing(coin);
      coin.body.setGravityY(0);
      coin.body.setMaxVelocity(COIN_SPEED);
      coins.push(coin);

      //Generate position
      let ok = null,
        t = 0;
      do {
        coin.setRandomPosition(0, -0.5 * HEIGHT, WIDTH, HEIGHT);
        ok = true;
        for (let j = 0; j < currentNumber; j++) {
          if (Math.abs(coin.x - coins[j].x) < 60) {
            ok = false;
            t++;
          }
        }
        if (t === 8) {
          break;
        }
      } while (!ok);

      currentNumber++;
    }
  }

  /** Make END GAME if lost control or crashed */
  endGameFunction() {
    gameMusic.stop();
    game.sound.add('boom').setVolume(0.1).play();
    setTimeout(() => {
      this.add
        .sprite(rocket.x, rocket.y, 'explosion')
        .play('explodeAnimation')
        .setScale(2.5);
    }, 100);
    setTimeout(() => {
      this.scene.start('endGameScene');
    }, 320);
    endGame = true;
  }

  update() {
    if (this.isHardModeEnable == 'true') {
      //Rotate barrel
      for (let i = 0; i < COINS_NUMBER; i++) {
        coins[i].angle += ANGLE_CHANGING_SPEED / 2;
        if (coins[i].angle == 360) {
          coins[i].angle = 0;
        }
      }
    }

    //Make parallax infinie background
    bg_0.tilePositionX = myCam.scrollX * 0.35;
    bg_0.tilePositionY = myCam.scrollY * 0.35;

    bg_1.tilePositionX = myCam.scrollX * 0.42;
    bg_1.tilePositionY = myCam.scrollY * 0.42;

    /* Mets movement */
    for (let i = 0; i < MET_NUMBER; i++) {
      //Mets down movement
      if (this.isHardModeEnable == 'true') {
        let a = getRandomInt(1, 3);
        if (i % 2 == 0) {
          mets[i].x += a;
        } else {
          mets[i].x -= a;
        }
      }

      if (mets[i].y < rocket.y - HEIGHT / 2 - 10) {
        mets[i].y += 5;
      } else {
        mets[i].y += BLOCK_SPEED;
      }

      //Mets rotating
      mets[i].angle += ANGLE_CHANGING_SPEED;
      if (mets[i].angle === 360) {
        mets[i].angle = 0;
      }

      //Redraw if need
      if (mets[i].y > rocket.y + HEIGHT / 2) {
        reDraw(i);
      }
      if (
        (mets[i].x < rocket.x - WIDTH / 2 - 30) |
        (mets[i].x > rocket.x + WIDTH / 2 + 30)
      ) {
        reDraw(i);
      }
    }

    /* Coins processing */
    for (let i = 0; i < COINS_NUMBER; i++) {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          rocket.getBounds(),
          coins[i].getBounds()
        ) & !endGame
      ) {
        if (this.isHardModeEnable == 'false') {
          //No hard mode
          collectSound.play({ loop: false });
        } else {
          this.fuel += FUEL_BOOST;
          if (this.fuel > 100) {
            this.fuel = 100;
          }
        }
        score += 10;
        scoreText.text = score;
        moneyReDraw(i);
      }

      //Redraw if coin's y wrong
      if (coins[i].y > rocket.y + HEIGHT / 2) {
        moneyReDraw(i);
      }

      //Redraw than coin's x wrong
      if (
        (coins[i].x < rocket.x - WIDTH / 2 - 30) |
        (coins[i].x > rocket.x + WIDTH / 2 + 30)
      ) {
        moneyReDraw(i);
      }
    }

    /*  User input processing  */
    let cursors = this.input.keyboard.createCursorKeys();
    let left = cursors.left.isDown,
      right = cursors.right.isDown,
      up = cursors.up.isDown;

    /* Rocket movement processing */
    //Left/Right rotate processing
    if (left | right) {
      rocket.body.acceleration.x =
        (Math.cos(rocket.rotation - ROTATION_FIX) * rocketSet.acceleration) / 5;
      if (left) {
        //if the LEFT key is down
        rocket.body.angularVelocity = -rocketSet.rotationSpeed;
      } else if (right) {
        //if the RIGHT key is down
        rocket.body.angularVelocity = rocketSet.rotationSpeed;
      }
    } else {
      //Stop rotate if LEFT & RIGHT keys is not down
      rocket.body.angularVelocity = 0;
    }

    if (up) {
      //Disable instuctions
      instructionsText.setVisible(false);

      //Fuel consumption
      if (this.isHardModeEnable == 'true') {
        this.fuel -= FUEL_CONSUMPTION_SPEED;
        this.fuelIndicator.clear();
        this.fuelIndicator.fillStyle(0xb36b00);
        this.fuelIndicator.fillRect(100, 30, (300 * this.fuel) / 100, 30);

        //End game if fuel is over
        if (this.fuel <= 0) {
          this.endGameFunction();
        }
      }

      //Set acceleration to rocket if UP key is down
      rocket.body.acceleration.x =
        Math.cos(rocket.rotation - ROTATION_FIX) * rocketSet.acceleration;
      rocket.body.acceleration.y =
        Math.sin(rocket.rotation - ROTATION_FIX) * rocketSet.acceleration;
    } else {
      //Set NO acceleration if UP key isn't down
      if (!left & !right) {
        rocket.body.acceleration.setTo(0, 0);
      }

      //Stop music
      rocketSound.setVolume(0);
    }

    /* Rocket animation */
    let a = getRandomInt(1, 2);
    if (!up) {
      if (!left & !right) {
        rocket.setTexture('engineOff');
      } //Without pressed keys(up- left- right-)
      else {
        //Play music
        if (!rocketSound.isPlaying) {
          rocketSound.play({ loop: true });
        }
        rocketSound.setVolume(0.5);

        //Fuel consumption
        if (this.isHardModeEnable == 'true') {
          this.fuel -= FUEL_CONSUMPTION_SPEED / 2;
          this.fuelIndicator.clear();
          this.fuelIndicator.fillStyle(0xb36b00);
          this.fuelIndicator.fillRect(100, 30, (300 * this.fuel) / 100, 30);

          //End game if fuel is over
          if (this.fuel <= 0) {
            this.endGameFunction();
          }
        }

        if (left & !right) {
          rocket.setTexture('leftRotating_' + a);
        } //Just left rotating(up- left+ right-)
        if (!left & right) {
          rocket.setTexture('rightRotating_' + a);
        } //Just right rotating(up- left- right+)
      }
    } else {
      //Play music
      if (!rocketSound.isPlaying) {
        rocketSound.play({ loop: true });
      }
      rocketSound.setVolume(0.5);

      if (!left & !right) {
        rocket.setTexture('engineOn_' + a);
      } //Just up(up+ left- right-)
      if (left & !right) {
        rocket.setTexture('leftUpRotating_' + a);
      } //left + up rotating(up+ left+ right-)
      if (!left & right) {
        rocket.setTexture('rightUpRotating_' + a);
      } //right + up rotating(up+ left- right+)
    }

    //Losing control check
    if ((rocket.body.rotation > 90) | (rocket.body.rotation < -90)) {
      if (startTime == null) {
        startTime = new Date().getTime();
      }
      currentTime = new Date().getTime();
      let losingTime = TIME_LIMIT - (currentTime - startTime) * MS_TO_S; //Time before lose control
      //If almost lose control
      if (losingTime < TIME_BEFORE_WARNING) {
        if ((losingTime <= 0) | (losingTimeCounter == 3)) {
          if (!endGame) {
            this.endGameFunction();
          }
        }
        wasDown = true;
        instructionsText.setVisible(false);
        losingControlText.setVisible(true);
        losingControlText.setText(
          Math.round(losingTime) + ' second to loss of control\nStart flying up'
        );
      }
    } else {
      if (wasDown) {
        wasDown = false;
        losingTimeCounter++;
      }
      losingControlText.setVisible(false);
      startTime = null;
    }
  }
}

class endGameScene extends Phaser.Scene {
  constructor() {
    super('endGameScene');
  }

  create() {
    rocketSound.stop();
    menuMusic = this.sound.add('startGameSceneMusic');
    menuMusic.play({ loop: true });

    this.add.image(0, 0, 'preview').setOrigin(0, 0);

    let newGameButton = this.add.sprite(
      START_X,
      START_Y + 275,
      'newGameButton'
    );
    newGameButton.setInteractive();
    newGameButton.on(
      'pointerdown',
      function () {
        sessionStorage.setItem(sessionStorageNameForNewGame, 'false');
        location.reload();
      },
      this
    );

    this.add
      .text(START_X, START_Y - 250, 'Game over :(', textConfig)
      .setOrigin(0.5, 0.5);

    let bestScore;
    if (localStorage.getItem(localStorageNameForHardMode) == 'false') {
      bestScore = localStorage.getItem(localStorageNameForBestScore);
    } else {
      bestScore = localStorage.getItem(localStorageNameForHardBestScore);
    }

    let text;
    if (score > bestScore) {
      text = 'Congratulations!\nYou have new best score:\n' + score;
      if (localStorage.getItem(localStorageNameForHardMode) == 'false') {
        localStorage.setItem(localStorageNameForBestScore, score);
      } else {
        localStorage.setItem(localStorageNameForHardBestScore, score);
      }
    } else {
      text = 'Your score is ' + score + '\nYour best score is ' + bestScore;
    }
    this.add.text(START_X, START_Y - 60, text, textConfig).setOrigin(0.5, 0.5);

    //Hard mode text
    this.add
      .text(140, HEIGHT - 50, 'Hard mode:', {
        fontSize: 42,
        fontFamily: 'VGAfontUpdate11',
        align: 'center',
        color: '#000000',
      })
      .setOrigin(0.5, 0.5);
    let text2 = '';
    if (localStorage.getItem(localStorageNameForHardMode) == 'true') {
      text2 = 'Enable';
    } else {
      text2 = 'Disable';
    }
    hardModeText = this.add
      .text(360, HEIGHT - 50, text2, {
        fontSize: 42,
        fontFamily: 'VGAfontUpdate11',
        align: 'center',
      })
      .setOrigin(0.5, 0.5);
    if (localStorage.getItem(localStorageNameForHardMode) == 'false') {
      hardModeText.setTint(0xff3300);
    } else {
      hardModeText.setTint(0x009900);
    }
    hardModeText.setInteractive();
    hardModeText.on('pointerdown', function () {
      if (localStorage.getItem(localStorageNameForHardMode) == 'false') {
        hardModeText.text = 'Enable';
        localStorage.setItem(localStorageNameForHardMode, 'true');
        hardModeText.clearTint();
        hardModeText.setTint(0x009900);
      } else {
        hardModeText.text = 'Disable';
        localStorage.setItem(localStorageNameForHardMode, 'false');
        hardModeText.clearTint();
        hardModeText.setTint(0xff3300);
      }
    });
  }
}

/** Get random integer in [min;max] */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/** Redraw meteorit  */
function reDraw(i) {
  //Generate position
  let ok;
  let t = 0;

  do {
    mets[i].setRandomPosition(
      rocket.x - WIDTH / 2,
      rocket.y - 1.5 * HEIGHT,
      WIDTH,
      HEIGHT
    );
    ok = true;
    for (let j = 0; j < MET_NUMBER; j++) {
      if (Math.abs(mets[i].x - mets[j].x) < 75 && i != j) {
        ok = false;
        t++;
      }
    }
    if (t >= 8) {
      break;
    }
  } while (!ok);
}

/** Redraw money when down or collected */
function moneyReDraw(i) {
  let ok;
  let t = 0;

  do {
    coins[i].setRandomPosition(
      rocket.x - WIDTH / 2,
      rocket.y - 1.5 * HEIGHT,
      WIDTH,
      HEIGHT
    );
    ok = true;
    for (let j = 0; j < COINS_NUMBER; j++) {
      if (Math.abs(coins[i].x - coins[j].x) < 40 && i != j) {
        ok = false;
        t++;
      }
    }
    if (t >= 8) {
      break;
    }
  } while (!ok);
}
