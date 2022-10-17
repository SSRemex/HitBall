import { _decorator, Component, Node, Vec2, Vec3, Sprite, Color, isValid, UITransform, v2, sp, v3, RigidBody2D, Collider2D, Contact2DType, Label, CircleCollider2D, 
    instantiate, Prefab, utils, randomRange } from 'cc';
import { Tools } from '../Tools';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {
    // 箱体分组
    public group: number = null

    @property(Prefab)
    ballPrefab: Prefab = null


    // 移动速度
    private defaultSpeed = 5
    private speed = 1
    // 是否为线速度
    public isLinear = true

    // 速度向量
    public vector: Vec2 = v2(5, 5)
    // 角度
    public angle: number = 0

    // 是否升级
    public isSplit = false

    // 方向数组
    private vec_dir: number[] = [-1, 1]



    // 组别 颜色 大小 速度
    public groupMap: Map<number, [string, number, number]> = new Map([
        [0, ["FF0000", 0.1, 1]],
        [1, ["00FFF9", 0.2, 1.2]],
        [2, ["FCE5CD", 0.4, 1.3]],
        [3, ["7700FF", 0.6, 1.4]],
        [4, ["FFFF00", 0.8, 1.5]],
        [5, ["70FF00", 1, 1.6]],
        [6, ["A522AA", 1.2, 1.7]],
        [7, ["0000FF", 1.4, 1.8]],
    ])

    onLoad() {
        this.node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.hitCallback, this)

    }
    update() {

    }

    init(group: number, pos: Vec3) {
        this.group = group  
        let color = this.groupMap.get(group)[0]
        let scale = this.groupMap.get(group)[1]
        let speed = this.groupMap.get(group)[2]

        this.angle = Tools.randomChoice(0, 360)
        // 颜色
        this.node.getChildByName("border").getComponent(Sprite).color = new Color().fromHEX(color)
        // 显示
        this.node.getChildByName("num").getComponent(Label).string = (this.group + 1).toString()

        this.node.scale = v3(scale, scale, scale)
        // 初始线速度
        this.speed = speed * this.defaultSpeed
        let dir = pos.normalize()

        let dir_x = dir.x * this.speed * this.getVecDir()
        let dir_y = dir.y * this.speed * this.getVecDir()
        this.node.getComponent(RigidBody2D).linearVelocity = v2(dir_x, dir_y)
        

    }

    hitCallback(selfCollider, otherCollider, contant) {
        let otherObj = otherCollider.getComponent(Bullet)
        if(otherObj instanceof Bullet) {
            this.ballSplit()
        }



    }

    ballSplit() {
        // 当前索引从0开始
        this.isSplit = true
        
        
    }

    private getVecDir(): number{
       return this.vec_dir[Math.floor(Math.random()*this.vec_dir.length)]
    }

    public getPos(): Vec3 {
        return this.node.getPosition()
    }

    public getGroup(): number {
        return this.group
    }

    public destory(): void {
        this.node.destroy()
    }




}

