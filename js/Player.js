import MatterEntity from './MatterEntity.js';

export default class Player extends MatterEntity {
  constructor(data) {
    let { scene, x, y, texture, frame } = data;
    super({ ...data, health: 5, drops: [], name: 'player' });
    this.touching = []
    // Weapon
    this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', 82);
    this.spriteWeapon.setScale(0.7)
    this.spriteWeapon.setOrigin(0.25, 0.5);
    this.scene.add.existing(this.spriteWeapon);

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    var playerCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'playerCollider' })
    var playerSensor = Bodies.circle(this.x, this.y, 24, { isSensor: true, label: 'playerSensor' })

    const compundBody = Body.create({
      parts: [playerCollider, playerSensor],
      frictionAir: 0.35,
    });

    this.setExistingBody(compundBody);
    this.setFixedRotation()
    this.createMiningCollisions(playerSensor)
    this.createPickupCollisions(playerCollider)
    this.scene.input.on('pointermove', pointer => { if (!this.dead) this.setFlipX(pointer.worldX < this.x) })
  }

  static preload(scene) {
    scene.load.atlas('female', 'assets/images/female.png', 'assets/images/female_atlas.json')
    scene.load.animation('female_anim', 'assets/images/female_anim.json')
    scene.load.spritesheet('items', 'assets/images/items.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.audio('player', 'assets/audio/player.mp3');
  }

  onDeath = () => {
    this.anims.stop();
    this.setTexture('items', 0);
    this.setOrigin(0.5);
    this.spriteWeapon.destroy()

  }

  update() {
    if (this.dead) return
    const speed = 2.5;
    let playerVelocity = new Phaser.Math.Vector2();
    if (this.inputKeys.left.isDown) {
      playerVelocity.x = -1
    } else if (this.inputKeys.right.isDown) {
      playerVelocity.x = 1
    }

    if (this.inputKeys.up.isDown) {
      playerVelocity.y = -1
    } else if (this.inputKeys.down.isDown) {
      playerVelocity.y = 1
    }

    playerVelocity.normalize()
    playerVelocity.scale(speed)
    this.setVelocity(playerVelocity.x, playerVelocity.y)
    if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
      this.anims.play('female_walk', true)
    } else {
      this.anims.play('female_idle', true)
    }
    this.spriteWeapon.setPosition(this.x, this.y)
    this.weaponRotate();
  }

  weaponRotate() {
    let pointer = this.scene.input.activePointer;
    if (pointer.isDown) {
      this.weaponRotation += 6;
    } else {
      this.weaponRotation = 0;
    }
    if (this.weaponRotation > 70) {
      this.whackStuff();
      this.weaponRotation = 0;
    }

    if (this.flipX) {
      this.spriteWeapon.setAngle(-this.weaponRotation - 90)
    } else {
      this.spriteWeapon.setAngle(this.weaponRotation)
    }
  }

  createMiningCollisions(playerSensor) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [playerSensor],
      callback: other => {
        if (other.bodyB.isSensor) return;
        this.touching.push(other.gameObjectB);
        console.log(other.gameObjectB)
        console.log(this.touching.length, other.gameObjectB.name)
      },
      context: this.scene,
    });
    this.scene.matterCollision.addOnCollideEnd({
      objectA: [playerSensor],
      callback: other => {
        console.log(this.touching)
        this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
      },
      context: this.scene
    })
  }

  createPickupCollisions(playerCollider) {
    this.scene.matterCollision.addOnCollideStart({
      objectA: [playerCollider],
      callback: other => {
        if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup()
      },
      context: this.scene,
    });
    this.scene.matterCollision.addOnCollideActive({
      objectA: [playerCollider],
      callback: other => {
        if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup()
      },
      context: this.scene
    })
  }

  whackStuff() {
    this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
    this.touching.forEach(gameobj => {
      gameobj.hit();
      if (gameobj.dead) gameobj.destroy()
    })
  }
}