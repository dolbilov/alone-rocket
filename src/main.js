/** @type {import("../typings/phaser")} */

//Consts & variables
const MET_NUMBER = 5,
    WIDTH = 1280,
    HEIGHT = 720,
    START_X = WIDTH / 2,
    START_Y = HEIGHT / 2,
    ROTATION_FIX = Math.PI / 2,
    BLOCK_SPEED = 2,
    VERSION = '1.8.2-a',
    ANGLE_CHANGING_SPEED = 2;

let game,
    rocket,
    rocketLogo,
    rocketSet = {
        rotationSpeed: 180,
        acceleration: 200,
        maxSpeed: 85,
        drag: 25,
        gravity: 100
    },
    score = 0,
    textConfig = {
        fontSize: 72,
        fontFamily: 'VGAfontUpdate11',
        align: 'center'
    },
    logoAngle = 0,
    menuMusic,
    gameMusic,
    bg_0,
    bg_1,
    mets = [],
    localStorageName = 'jarisBestScore',
    sessionStorageName = 'isNewGame',
    texture1Count = 0,
    texture2Count = 0,
    currentNumber = 0,
    scoreText,
    bootText,
    rocketSound,
    hardModeText,
    myCam,
    endGame = false;


window.onload = function() {
    let config = {
        type: Phaser.AUTO,
        width: WIDTH,
        height: HEIGHT,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: rocketSet.gravity },
                debug: false
            }
        },
        audio: { disableWebAudio: true },
        scene: [bootScene, startGameScene, gameScene, endGameScene ]
    }
    game = new Phaser.Game(config);
    window.focus();
}

/**** Scenes set-up ****/
class bootScene extends Phaser.Scene {
    constructor() {
        super('bootScene');
    }

    preload() {
        if (sessionStorage.getItem(sessionStorageName) === null) {
            sessionStorage.setItem(sessionStorageName, 'true');
        }
        // Make preloading scene \\
        if (sessionStorage.getItem(sessionStorageName) == 'true') {
            let d = 15;
            let progressBox = this.add.graphics();
            progressBox.fillStyle(0x222222, 0.8);
            progressBox.fillRect(START_X - 160, START_Y - 25 - d, 320, 50);

            let textStyle = {
                font: '20px monospace',
                fill: '#fff',
                align: 'center'
            }

            let loadingText = this.make.text({
                x: START_X,
                y: START_Y + 30,
                text: 'Loading...',
                textStyle
            });
            loadingText.setOrigin(0.5, 0.5);

            let percentText = this.make.text({
                x: START_X,
                y: START_Y + 55,
                text: '0%',
                textStyle
            });
            percentText.setOrigin(0.5, 0.5);

            let assetText = this.make.text({
                x: START_X,
                y: START_Y + 80,
                text: '',
                textStyle
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

        /****   Loading assets   ****/
        //Spritesheets load
        this.load.spritesheet('explosion', '../assets/img/explosion.png', {
            frameWidth: 64,
            frameHeight: 64,
            endFrame: 23
        });
        //Images load
        this.load.image('preview', '../assets/img/preview.jpg');
        this.load.image('kvantumLogo', '../assets/img/kvantumLogo.png');
        this.load.image('githubLogo', '../assets/img/githubLogo.png')
        this.load.image('startButton', '../assets/img/startButton.png');
        this.load.image('background_0', '../assets/img/background_0.png');
        this.load.image('background_1', '../assets/img/background_1.png');
        this.load.image('meteorite1', '../assets/img/meteorite1.png');
        this.load.image('meteorite2', '../assets/img/meteorite2.png');
        this.load.image('newGameButton', '../assets/img/newGameButton.png');
        this.load.image('engineOff', '../assets/img/rocket/engineOff.png');
        this.load.image('engineOn_1', '../assets/img/rocket/engineOn_1.png');
        this.load.image('engineOn_2', '../assets/img/rocket/engineOn_2.png');
        this.load.image('leftRotating_1', '../assets/img/rocket/leftRotating_1.png');
        this.load.image('leftRotating_2', '../assets/img/rocket/leftRotating_2.png');
        this.load.image('leftUpRotating_1', '../assets/img/rocket/leftUpRotating_1.png');
        this.load.image('leftUpRotating_2', '../assets/img/rocket/leftUpRotating_2.png');
        this.load.image('rightRotating_1', '../assets/img/rocket/rightRotating_1.png');
        this.load.image('rightRotating_2', '../assets/img/rocket/rightRotating_2.png');
        this.load.image('rightUpRotating_1', '../assets/img/rocket/rightUpRotating_1.png');
        this.load.image('rightUpRotating_2', '../assets/img/rocket/rightUpRotating_2.png');


        //Audio load
        this.load.audio('startGameSceneMusic', [
            '../assets/audio/startGameSceneMusic.ogg',
            '../assets/audio/startGameSceneMusic.mp3'
        ]);
        this.load.audio('gameSceneMusic', [
            '../assets/audio/gameSceneMusic.ogg',
            '../assets/audio/gameSceneMusic.mp3'
        ]);
        this.load.audio('boom', [
            '../assets/audio/boom.ogg',
            '../assets/audio/boom.mp3'
        ]);
        this.load.audio('rocketSound', [
            '../assets/audio/rocketSound.ogg',
            '../assets/audio/rocketSound.mp3'
        ]);
    }

    create() {
        if (sessionStorage.getItem(sessionStorageName) !== 'true') {
            this.scene.start('gameScene');
        }
        sessionStorage.setItem(sessionStorageName, 'true');

        let preview = this.add.sprite(START_X, START_Y, 'preview');
        preview.setInteractive();
        preview.on('pointerdown', function() {
            this.scene.start('startGameScene');
        }, this);

        bootText = this.add.text(START_X, START_Y, 'Tap anywhere to start', textConfig).setOrigin(0.5, 0.5);

        let isTextBecomingVisible = false;
        setInterval(function () {
            if (!isTextBecomingVisible) {
                bootText.alpha -= 0.01;
                if (bootText.alpha === 0) { isTextBecomingVisible = true; }
            } else {
                bootText.alpha += 0.01;
                if (bootText.alpha === 1) { isTextBecomingVisible = false; }
            }
        }, 10);
    }
}


class startGameScene extends Phaser.Scene {
    constructor() {
        super("startGameScene");
    }


    create() {
        menuMusic = this.sound.add('startGameSceneMusic', { loop: true });
        menuMusic.play();

        this.add.image(START_X, START_Y, 'preview');

        let button = this.add.image(START_X, START_Y + 280, 'startButton').setInteractive();
        button.setOrigin(0.5, 0.5);
        button.on('pointerdown', function(pointer) {
            menuMusic.stop();
            this.scene.start('gameScene');
        }, this);

        this.add.image(WIDTH * 0.9, START_Y, 'kvantumLogo').setScale(0.5, 0.5);

        rocketLogo = this.add.sprite(WIDTH * 0.1, START_Y, 'engineOff').setScale(0.5, 0.5);

        let smallTextConfig = {
                fontSize: 42,
                fontFamily: 'VGAfontUpdate11',
                align: 'center'
        };

        this.add.text(WIDTH - 285, HEIGHT - 75, 'v' + VERSION, {
            fontSize: 56,
            fontFamily: 'VGAfontUpdate11',
            align: 'center',
            color: '#000000'
        });

        this.add.text(20, HEIGHT - 115, 'Visit us here ->', {
            fontSize: 42,
            fontFamily: 'VGAfontUpdate11',
            align: 'center',
            color: '#000000'
        });

        let githubLogo = this.add.image(START_X - 200, HEIGHT - 100, 'githubLogo');
        githubLogo.setInteractive();
        githubLogo.on('pointerdown', function() {
            window.open("https://github.com/dolbilov/dolbilov.github.io");
        }, this);

        this.add.text(140, HEIGHT - 50, 'Hard mode:', {
            fontSize: 42,
            fontFamily: 'VGAfontUpdate11',
            align: 'center',
            color: '#000000'
        }).setOrigin(0.5, 0.5);
        if (sessionStorage.getItem('isHardModeEnable') === null) {
            sessionStorage.setItem('isHardModeEnable', 'false');
        }
        let text2 = '';
        if (sessionStorage.getItem('isHardModeEnable') == 'true') {
            text2 = 'Enable';
        } else {
            text2 = 'Disable';
        }
        hardModeText = this.add.text(360, HEIGHT - 50, text2, {
            fontSize: 42,
            fontFamily: 'VGAfontUpdate11',
            align: 'center',
        }).setOrigin(0.5, 0.5);
        if (sessionStorage.getItem('isHardModeEnable') == 'false') {
            hardModeText.setTint(0xff3300);
        } else {
            hardModeText.setTint(0x009900);
        }
        hardModeText.setInteractive();
        hardModeText.on('pointerdown', function() {
            if (sessionStorage.getItem('isHardModeEnable') == 'false') {
                hardModeText.text = 'Enable';
                sessionStorage.setItem('isHardModeEnable', 'true');
                hardModeText.clearTint();
                hardModeText.setTint(0x009900);
            } else {
                hardModeText.text = 'Disable';
                sessionStorage.setItem('isHardModeEnable', 'false');
                hardModeText.clearTint();
                hardModeText.setTint(0xff3300);
            }
        });


        this.add.text(START_X, START_Y - 290, 'Just alone rocket\nin the space', textConfig).setOrigin(0.5, 0.5);
        this.add.text(START_X - 200, START_Y - 140, 'Directed by:\nAntipov Dmitriy', smallTextConfig).setOrigin(0.5, 0.5);
        this.add.text(START_X - 200, START_Y - 45, 'Programmer:\nDolbilov Kirill', smallTextConfig).setOrigin(0.5, 0.5);
        this.add.text(START_X - 200, START_Y + 80, 'Designers:\nChirkov Anatoliy\nVedin Ilya', smallTextConfig).setOrigin(0.5, 0.5);
        this.add.text(START_X + 220, START_Y - 20, 'Thank you to\nall the testers:\nAleksandr\nGorbachenkov\n\nOleg Chernov\n\nRoman Chernov\n\nDanil Shanin', smallTextConfig).setOrigin(0.5, 0.5);
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


class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }


    create() {
        //Explosion animation
        let animConfig = {
            key: 'explodeAnimation',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23, first: 23 }),
            frameRate: 20,
            repeat: -1
        }
        this.anims.create(animConfig);

        //Music & sound
        rocketSound = this.sound.add('rocketSound');
        rocketSound.setVolume(0);
        gameMusic = this.sound.add('gameSceneMusic');
        gameMusic.play({loop: true});
        gameMusic.setVolume(0.2);

        //Background
        bg_0 = this.add.tileSprite(0, 0, 1280,720, 'background_0');
        bg_0.setOrigin(0, 0);
        bg_0.setScrollFactor(0);

        bg_1 = this.add.tileSprite(0, 0, 1280,720, 'background_1');
        bg_1.setOrigin(0, 0);
        bg_1.setScrollFactor(0);
        bg_1.setAlpha(0.6);

        //Rocket
        rocket = this.physics.add.sprite(START_X, START_Y + 300, 'engineOff').setScale(0.25);
        rocket.body.bounce.setTo(0.25, 0.25);
        rocket.body.maxVelocity.setTo(rocketSet.maxSpeed, rocketSet.maxSpeed);
        rocket.body.drag.setTo(rocketSet.drag, rocketSet.drag);
        myCam = this.cameras.main.startFollow(rocket);

        //Score text
        scoreText = this.add.text(50, 50, score, textConfig);
        scoreText.setOrigin(0.5, 0.5);
        scoreText.setScrollFactor(0);

        //Met generate function
        for (let i = 0; i < MET_NUMBER; i++) {
            let met = this.add.sprite(0, 0, 'meteorite1');
            this.physics.add.existing(met);
            met.body.setGravityY(0);
            met.body.setMaxVelocity(BLOCK_SPEED);
            met.angle = getRandomInt(0, 360);
            mets.push(met);

            //Generate texture
            if (Math.random() < 0.5) {
                met.setTexture('meteorite1');
                texture1Count++;
            } else {
                met.setTexture('meteorite2');
                texture2Count++;
            }

            //Change texture if all mets has same textures
            if (texture1Count === MET_NUMBER) {
                let b = getRandomInt(0, MET_NUMBER - 1);
                mets[b].setTexture('meteorite2');
                texture1Count--;
                texture2Count++;
            } else if (texture2Count === MET_NUMBER) {
                let b = getRandomInt(0, MET_NUMBER - 1);
                mets[b].setTexture('meteorite1');
                texture2Count--;
                texture1Count++;
            }

            //Generate position
            let ok, t = 0;
            do {
                met.setRandomPosition(0, -1.5 * HEIGHT, WIDTH, HEIGHT);
                ok = true;
                for (let j = 0; j < currentNumber; j++) {
                    if (Math.abs(met.x - mets[j].x) < 100) { ok = false; t++; }
                }
                if (t === 8) { break; }
            } while (!ok);

            currentNumber++;
        }

        //Crash check
        this.physics.add.overlap(rocket, mets, function () {
            if (!endGame) {
                gameMusic.stop();
                rocket.body.acceleration.setTo(0, 0);
                rocket.body.velocity.setTo(0, 0);
                this.sound.add('boom').setVolume(0.1).play();
                setTimeout(() => {
                    this.add.sprite(rocket.x, rocket.y, 'explosion').play('explodeAnimation').setScale(2.5);
                }, 100)
                setTimeout(() => {
                    this.scene.start('endGameScene');
                }, 280);
                endGame = true;
            }
        }, null, this);
    }


    update() {
        //Make parallax infinie background
        bg_0.tilePositionX = myCam.scrollX * 0.35;
        bg_0.tilePositionY = myCam.scrollY * 0.35;

        bg_1.tilePositionX = myCam.scrollX * 0.55;
        bg_1.tilePositionY = myCam.scrollY * 0.55;


        /****   Mets movement   ****/
        for (let i = 0; i < MET_NUMBER; i++) {
            //Mets down movement
            if (sessionStorage.getItem('isHardModeEnable') == 'true') {
                if (i % 2 == 0) {
                    mets[i].x += 1;
                } else {
                    mets[i].x -= 1;
                }
            }
            if (mets[i].y < rocket.y - HEIGHT / 2 - 10){
                mets[i].y += 5;
            } else {
                mets[i].y += BLOCK_SPEED;
            }

            //Mets rotating
            mets[i].angle += ANGLE_CHANGING_SPEED;
            if (mets[i].angle === 360) { mets[i].angle = 0; }

            //Redraw if need
            if ((mets[i].y > rocket.y + HEIGHT / 2)) {
                score++;
                scoreText.setText(score);
                reDraw(i);
            }
            if ((mets[i].x < rocket.x - WIDTH / 2 - 30) | (mets[i].x > rocket.x + WIDTH / 2 + 30)) {
                reDraw(i);
            }
        }

        /****   User input processing   ****/
        let cursors = this.input.keyboard.createCursorKeys();
        let left = cursors.left.isDown,
            right = cursors.right.isDown,
            up = cursors.up.isDown;

        // Rocket movement processing \\
        //Left/Right rotate processing
        if (left | right) {
            rocket.body.acceleration.x = Math.cos(rocket.rotation - ROTATION_FIX) * rocketSet.acceleration / 5;
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
            //Set acceleration to rocket if UP key is down
            rocket.body.acceleration.x = Math.cos(rocket.rotation - ROTATION_FIX) * rocketSet.acceleration;
            rocket.body.acceleration.y = Math.sin(rocket.rotation - ROTATION_FIX) * rocketSet.acceleration;
        } else {
            //Set NO acceleration if UP key isn't down
            if (!left & !right) {
                rocket.body.acceleration.setTo(0, 0);
            }

            //Stop music
            rocketSound.setVolume(0);
        }

        /****   Rocket animation   ****/
        let a = getRandomInt(1, 2);
        if (!up) {
            if (!left & !right) { rocket.setTexture('engineOff'); } //Without pressed keys(up- left- right-)
            else {
                //Play music
                if (!rocketSound.isPlaying) {
                    rocketSound.play({ loop: true });
                }
                rocketSound.setVolume(0.5);

                if (left & !right) { rocket.setTexture('leftRotating_' + a); } //Just left rotating(up- left+ right-)
                if (!left & right) { rocket.setTexture('rightRotating_' + a); } //Just right rotating(up- left- right+)
            }
        } else {
            //Play music
            if (!rocketSound.isPlaying) {
                rocketSound.play({ loop: true });
            }
            rocketSound.setVolume(0.5);

            if (!left & !right) { rocket.setTexture('engineOn_'+a); } //Just up(up+ left- right-)
            if (left & !right) { rocket.setTexture('leftUpRotating_'+a); } //left + up rotating(up+ left+ right-)
            if (!left & right) { rocket.setTexture('rightUpRotating_'+a); } //right + up rotating(up+ left- right+)
        }

        /* if (rocket.body.velocity.x != 0) {
            rocket.rotation = Math.atan2(rocket.body.velocity.y, rocket.body.velocity.x);
        } */
    }
}


class endGameScene extends Phaser.Scene {
    constructor() {
        super("endGameScene");
    }


    create() {
        rocketSound.stop();
        menuMusic = this.sound.add('startGameSceneMusic');
        menuMusic.play({loop: true});

        this.add.image(0, 0, 'preview').setOrigin(0, 0);

        let newGameButton = this.add.sprite(START_X, START_Y + 275, 'newGameButton');
        newGameButton.setInteractive();
        newGameButton.on('pointerdown', function() {
            sessionStorage.setItem(sessionStorageName, 'false');
            location.reload();
        }, this);

        this.add.text(START_X, START_Y - 250, 'Game over :(', textConfig).setOrigin(0.5, 0.5);
        let bestScore = localStorage.getItem(localStorageName);
        if (bestScore === null) {
            bestScore = 0;
        }
        let text;
        if (score > bestScore) {
            text = 'Congratulations!\nYou have new best score:\n' + score;
            localStorage.setItem(localStorageName, score);
        }
        else {
            text = 'Your score is ' + score + '\nYour best score is ' + bestScore;
        }
        this.add.text(START_X, START_Y - 60, text, textConfig).setOrigin(0.5, 0.5);

        //Hard mode text
        this.add.text(140, HEIGHT - 50, 'Hard mode:', {
            fontSize: 42,
            fontFamily: 'VGAfontUpdate11',
            align: 'center',
            color: '#000000'
        }).setOrigin(0.5, 0.5);
        let text2 = '';
        if (sessionStorage.getItem('isHardModeEnable') == 'true') {
            text2 = 'Enable';
        } else {
            text2 = 'Disable';
        }
        hardModeText = this.add.text(360, HEIGHT - 50, text2, {
            fontSize: 42,
            fontFamily: 'VGAfontUpdate11',
            align: 'center',
        }).setOrigin(0.5, 0.5);
        if (sessionStorage.getItem('isHardModeEnable') == 'false') {
            hardModeText.setTint(0xff3300);
        } else {
            hardModeText.setTint(0x009900);
        }
        hardModeText.setInteractive();
        hardModeText.on('pointerdown', function() {
            if (sessionStorage.getItem('isHardModeEnable') == 'false') {
                hardModeText.text = 'Enable';
                sessionStorage.setItem('isHardModeEnable', 'true');
                hardModeText.clearTint();
                hardModeText.setTint(0x009900);
            } else {
                hardModeText.text = 'Disable';
                sessionStorage.setItem('isHardModeEnable', 'false');
                hardModeText.clearTint();
                hardModeText.setTint(0xff3300);
            }
        });
    }
}


// EXTRA FUNCTIONS \\
/** Get random integer in [min;max] */
function getRandomInt(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

/** Redraw meteorit  */
function reDraw(i) {
    //Generate texture
    if (Math.random() < 0.5) {
        mets[i].setTexture('meteorite1');
        texture1Count++;
    } else {
        mets[i].setTexture('meteorite2');
        texture2Count++;
    }

    //Change texture if all mets has same textures
    if (texture1Count === MET_NUMBER) {
        mets[i].setTexture('meteorite2');
        texture1Count--;
        texture2Count++;
    } else if (texture2Count === MET_NUMBER) {
        mets[i].setTexture('meteorite1');
        texture2Count--;
        texture1Count++;
    }

    //Generate position
    let ok, t = 0;
    do {
        mets[i].setRandomPosition(rocket.x - WIDTH / 2, rocket.y - 1.5 * HEIGHT, WIDTH, HEIGHT);
        ok = true;
        for (let j = 0; j < MET_NUMBER; j++) {
            if ((Math.abs(mets[i].x - mets[j].x) < 75) && (i != j)) { ok = false; t++; }
        }
        if (t >= 8) { break; }
    } while (!ok);
}