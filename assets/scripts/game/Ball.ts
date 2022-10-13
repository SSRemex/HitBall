import { _decorator, Component, Node, Vec2, Vec3, Sprite, Color, isValid, UITransform, v2, sp, v3, RigidBody2D, Collider2D, Contact2DType, Label, CircleCollider2D, 
    instantiate, Prefab } from 'cc';
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
    public vector: Vec2 = v2(0, 0)
    // 角度
    public angle: number = 0

    // 是否升级
    public isUpgrade = false



    // 组别颜色大小速度
    public groupMap: Map<number, [string, number, number]> = new Map([
        [0, ["FF0000", 0.5, 5]],
        [1, ["00FFF9", 0.75, 4.5]],
        [2, ["FCE5CD", 1, 4]],
        [3, ["7700FF", 1.25, 3.5]],
        [4, ["FFFF00", 1.5, 3]],
        [5, ["70FF00", 1.75, 2.5]],
        [6, ["A522AA", 2, 2]],
        [7, ["0000FF", 2.25, 1.5]],
    ])

    onLoad() {
        this.node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.hitCallback, this)

    }
    update() {
        // 在摇杆结束时不设置线速度，通过线性阻尼进行减速
        if (this.vector.x != 0 && this.vector.y != 0) {
            // 向量归一化
            let dir = this.vector.normalize()
            this.node.angle = this.angle

            // 乘速度
            let dir_x = dir.x * this.speed
            let dir_y = dir.y * this.speed
            if(this.isLinear){
                this.node.getComponent(RigidBody2D).linearVelocity = v2(dir_x, dir_y)
            }
            else {
                // 角色坐标加上方向
                let x = this.node.position.x + dir_x/10
                let y = this.node.position.y + dir_y/10
                this.check_border(x, y)
            }

            
        }

    }

    init(group: number) {
        this.group = group
        let color = this.groupMap.get(group)[0]
        let scale = this.groupMap.get(group)[1]
        let speed = this.groupMap.get(group)[2]

        // 颜色
        this.node.getChildByName("border").getComponent(Sprite).color = new Color().fromHEX(color)
        // 显示
        this.node.getChildByName("num").getComponent(Label).string = (this.group + 1).toString()

        this.node.scale = v3(scale, scale, scale)
        this.speed = speed * this.defaultSpeed


    }

    hitCallback(selfCollider, otherCollider, contant) {
        if (selfCollider instanceof CircleCollider2D && otherCollider instanceof CircleCollider2D) {
            // 当前节点没被调用destroy
            let otherGroup = otherCollider.node.getComponent(Ball).getGroup()
            if (this.group == otherGroup && this.group < (this.groupMap.size - 1)) {
                if (isValid(selfCollider.node)) {
                    this.removeBall(otherCollider.node)
                    this.ballUpgrade()
                }
            }
        }



    }

    ballUpgrade() {
        // 当前索引从0开始，需要比groupMap.size - 1 小
        if(this.group < (this.groupMap.size - 1)){
            this.isUpgrade = true
            this.group += 1
        }
        
    }

    private removeBall(item: Node) {
        if (isValid(item, true)) {
            setTimeout(() => {
                item.destroy()
            }, 0)
        }
    }

    check_border(x: number, y: number){
        const right_x = 310
        const left_x = -right_x
        const top_y = 620
        const bottom_y = -top_y

        x = x > right_x ? right_x : x
        x = x < left_x ? left_x : x
        y = y > top_y ? top_y : y
        y = y < bottom_y ? bottom_y : y

        this.node.setPosition(x, y)
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

