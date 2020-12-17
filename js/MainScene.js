import Player from './Player.js';
import Resource from './Resource.js';
import Enemy from './Enemy.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.enemies = []
  }

  preload() {
    Player.preload(this)
    Resource.preload(this)
    Enemy.preload(this)
    this.load.image('tiles', 'assets/images/IceTileset.png');
    this.load.tilemapTiledJSON('map', 'assets/images/map.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('IceTileset', 'tiles', 32, 32);
    const layer1 = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
    const layer2 = map.createStaticLayer('Tile Layer 2', tileset, 0, 0);
    layer1.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(layer1);
    console.log(map.getObjectLayer('Enemies'))
    map.getObjectLayer('Enemies').objects.forEach(enemy => this.enemies.push(new Enemy({ scene: this, enemy })))
    map.getObjectLayer('Resources').objects.forEach(resource => new Resource({ scene: this, resource }))
    this.player = new Player({ scene: this, x: 200, y: 250, texture: 'female', frame: 'princess_idle_1' });
    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    })
  }



  update() {
    this.enemies.forEach(enemy => enemy.update());
    this.player.update();
  }
}