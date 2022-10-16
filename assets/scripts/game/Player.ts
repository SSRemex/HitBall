import { _decorator, Component, Node, Vec3, Camera, v3, v2, UITransform, math, instantiate, Prefab, RigidBody2D, Collider2D, Contact2DType, Label } from 'cc';
import { Ball } from './Ball';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property(Node)
    hpLabel: Node = null

    @property(Node)
    colimator: Node = null

    @property(Camera)
    uiCamera: Camera = null

    @property(Node)
    clip: Node = null

    @property(Prefab)
    bullet: Prefab = null

    // 默认hp
    public defaultHp: number = 10

    // HP
    public hp: number = this.defaultHp

    // 准星弧度
    public colimatorRadian: number = Math.PI / 2
    // 准星半径
    public colimatorRadius: number = 80
    // 准星速度
    public colimatorSpeed: number = 20

    // 是否开火
    public isFire: boolean = true

    

    onLoad() {
        this.hpLabel.getComponent(Label).string = this.hp.toString()
        this.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.playerHitCallback, this)
    }
    
    start() {
        
    }

    update() {
        this.colimiatorMove()

        
    }


    // 开火
    fire() {
        let node = instantiate(this.bullet)

        // 获取准星位置向量，归一化，作为子弹线速度向量
        let vec = v2(this.colimator.position.x, this.colimator.position.y)
        node.getComponent(Bullet).init(vec)
        this.clip.addChild(node)
    }

    // 玩家碰撞检测
    playerHitCallback(selfCollider, otherCollider, contant) {
        let ball = otherCollider.getComponent(Ball)
        if(ball instanceof Ball) {
            this.hp -= 1
        }
        this.hpLabel.getComponent(Label).string = this.hp.toString()
    }

    // 子弹销毁
    bulletDestroy() {
        this.clip.children.forEach((item) => {
            let bullet = item.getComponent(Bullet)
            if(bullet.isDestroy) {
                item.destroy()
            }
        })
    }


    // 准星半径限制
    limitMidNodePos(pos: Vec3): Vec3 {
        const R = 20
        // 获取当前位置长度
        const len = pos.length()
        // 计算 len 与R的关系，比例限制
        const ratio = len > R ? R / len  : 1

        return new Vec3(pos.x * ratio, pos.y * ratio)
    }

    // 准星弧度运动
    colimiatorMove() {
        
        // 圆心 0,0
        let x = this.colimatorRadius * Math.cos(this.colimatorRadian) + 0
        let y = this.colimatorRadius * Math.sin(this.colimatorRadian) + 0
        this.colimator.position = v3(x, y, 0)
    }




}

