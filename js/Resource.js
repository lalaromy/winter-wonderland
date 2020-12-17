import MatterEntity from './MatterEntity.js';

export default class Resources extends MatterEntity {
  static preload(scene) {
    scene.load.atlas('resources', 'assets/images/ressources.png', 'assets/images/ressources_atlas.json')
    scene.load.audio('tree', 'assets/audio/tree.mp3');
    scene.load.audio('rock', 'assets/audio/rock.mp3');
    scene.load.audio('bush', 'assets/audio/bush.mp3');
    scene.load.audio('wood', 'assets/audio/wood.mp3');
    scene.load.audio('sign', 'assets/audio/sign.mp3');
    scene.load.audio('pickup', 'assets/audio/pickup.mp3');
  }

  constructor(data) {
    let { scene, resource } = data;
    let drops = JSON.parse(resource.properties.find(p => p.name == 'drops').value);
    let depth = resource.properties.find(p => p.name == 'depth').value;
    super({
      scene, x:
        resource.x, y: resource.y,
      texture: 'resources',
      frame: resource.name,
      drops,
      depth,
      health: 5,
      name: resource.name
    })

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    var circleCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'collider' })
    this.setExistingBody(circleCollider);
    this.setStatic(true);
  }
}