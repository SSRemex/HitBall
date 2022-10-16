import { _decorator, Component, Vec2, v3,Collider2D, Contact2DType, v2, RigidBody2D } from 'cc';
import { Ball } from './Ball';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {


    // 撞击次数
    private hitNum = 3

    // 是否毁灭
    public isDestroy = false

    // 子弹速度
    private bulletSpeed = 100

    onLoad() {
        this.node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.hitCallback, this)
    }

    update() {

        if (this.isDestroy) {
            this.node.destroy()
        }

    }

    init(pos: Vec2) {
        this.node.position = v3(pos.x, pos.y, 0)
        let dir = pos.normalize()
        let vec_x = dir.x * this.bulletSpeed
        let vec_y = dir.y * this.bulletSpeed
        console.log(vec_x, vec_y)
        this.node.getComponent(RigidBody2D).linearVelocity = v2(vec_x, vec_y)
    }


    hitCallback(selfCollider, otherCollider, contant) {
        let ballrObj = otherCollider.getComponent(Ball)
        if (ballrObj instanceof Ball) {
            // this.node.destroy()
            //  this.isDestroy = true

        }
        let playerObj = otherCollider.getComponent(Player)

        if (!(playerObj instanceof Player)) {
            this.hitNum -= 1
        }
        if (this.hitNum <= 0) {
            this.isDestroy = true
        }




    }

}

